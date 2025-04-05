// services/invoices.services.js
const Invoices = require("../models/invoice.models");
const InvoiceDetail = require("../models/invoiceDetail.models");
const Items = require("../models/items.models");
const Users = require("../models/users.models");
const Stock = require("../models/stock.models");
const InventoryHistory = require("../models/inventoryHistory.models");

const { Sequelize, Op } = require("sequelize");
const uuid = require("uuid");
const Department = require("../models/deparment.models");

const findAllInvoices = async (startDate, endDate) => {
    return await Invoices.findAll({
        where: {
            createdAt: {
                [Op.between]: [
                    new Date(`${startDate}T00:00:00.000Z`), // Desde el inicio del día en UTC
                    new Date(`${endDate}T23:59:59.999Z`), // Hasta el final del día en UTC
                ],
            },
        },
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: InvoiceDetail,
                include: [Items],
            },
            {
                model: Users,
                as: "debtor",
                attributes: ["firstName", "lastName", "phone", "email"],
            },
            {
                model: Users,
                as: "vendor",
                attributes: ["firstName", "lastName", "phone", "email"],
            },
        ],
    });
};

const findInvoiceById = async (id) => {
    return await Invoices.findByPk(id, {
        include: [
            {
                model: InvoiceDetail,
                include: [Items],
            },
            {
                model: Users,
                as: "debtor",
                attributes: { exclude: ["password"] },
            },
            {
                model: Users,
                as: "vendor",
                attributes: ["firstName", "lastName", "phone", "email"],
            },
        ],
    });
};

const createInvoice = async (invoiceData) => {
    const { invoiceDetails, ...invoiceInfo } = invoiceData;

    if (!invoiceDetails || invoiceDetails.length === 0) {
        throw new Error("La factura no tiene productos.");
    }

    return await Invoices.sequelize.transaction(async (t) => {
        // Obtener el último número de factura
        const lastInvoice = await Invoices.findOne({
            order: [["invoiceNumber", "DESC"]],
            transaction: t,
        });

        const nextInvoiceNumber = lastInvoice
            ? lastInvoice.invoiceNumber + 1
            : 1;

        // Validar stock antes de crear la factura
        for (const detail of invoiceDetails) {
            const item = await Items.findByPk(detail.itemId, {
                transaction: t,
            });

            if (!item) {
                throw new Error(
                    `El producto con ID ${detail.itemId} no existe.`
                );
            }

            if (item.stock < detail.quantity) {
                throw new Error(
                    `Stock insuficiente para el producto de id:${item.id}. nombrado: ${item.name}. Disponible: ${item.stock}, solicitado: ${detail.quantity}`
                );
            }
        }

        // Crear la factura
        const newInvoice = await Invoices.create(
            {
                ...invoiceInfo,
                invoiceNumber: nextInvoiceNumber,
            },
            { transaction: t }
        );

        // Crear los detalles de la factura con `itemId`
        const details = invoiceDetails.map((detail) => ({
            ...detail,
            id: uuid.v4(),
            invoiceId: newInvoice.id,
        }));

        await InvoiceDetail.bulkCreate(details, { transaction: t });

        // Reducir el stock de los productos
        for (const detail of invoiceDetails) {
            await Items.decrement("stock", {
                by: detail.quantity,
                where: { id: detail.itemId },
                transaction: t,
            });
        }

        return newInvoice;
    });
};

//desde aqui lo nuevo

const validateStockByDepartment = async (invoiceDetails) => {
    const errors = [];
    const stockValidations = [];

    await Promise.all(
        invoiceDetails.map(async (detail) => {
            try {
                // Verificar si el item tiene stock infinito
                const item = await Items.findByPk(detail.itemId, {
                    attributes: ["id", "name", "infiniteStock"],
                });

                if (item.infiniteStock) {
                    stockValidations.push({
                        itemId: detail.itemId,
                        departmentId: detail.departmentId,
                        quantity: detail.quantity,
                        itemName: detail.itemName,
                        infiniteStock: true, // Marcamos para saltar validación
                    });
                    return;
                }

                // Sumar todas las cantidades disponibles en el departamento
                const stocks = await Stock.findAll({
                    where: {
                        itemId: detail.itemId,
                        departmentId: detail.departmentId,
                    },
                    attributes: [
                        [
                            Sequelize.fn("SUM", Sequelize.col("quantity")),
                            "totalQuantity",
                        ],
                    ],
                    raw: true,
                });

                const totalAvailable = parseInt(stocks[0].totalQuantity) || 0;

                if (totalAvailable < detail.quantity) {
                    const department = await Department.findByPk(
                        detail.departmentId
                    );
                    errors.push(
                        `Stock insuficiente para ${detail.itemName} en ${
                            department?.name || "el departamento"
                        }. ` +
                            `Disponible: ${totalAvailable}, Solicitado: ${detail.quantity}`
                    );
                } else {
                    stockValidations.push({
                        itemId: detail.itemId,
                        departmentId: detail.departmentId,
                        quantity: detail.quantity,
                        itemName: detail.itemName,
                        infiniteStock: false,
                    });
                }
            } catch (error) {
                errors.push(
                    `Error validando stock para ${detail.itemName}: ${error.message}`
                );
            }
        })
    );

    return {
        valid: errors.length === 0,
        errors,
        itemsToProcess: stockValidations,
    };
};

const createInvoiceTransaction = async (invoiceData) => {
    return await Invoices.sequelize.transaction(async (t) => {
        // 1. Obtener número de factura (optimizado)
        const [lastInvoice] = await Invoices.findAll({
            limit: 1,
            order: [["invoiceNumber", "DESC"]],
            attributes: ["invoiceNumber"],
            transaction: t,
            raw: true,
        });
        const nextInvoiceNumber = lastInvoice
            ? lastInvoice.invoiceNumber + 1
            : 1;

        // 2. Crear factura (optimizado)
        const newInvoice = await Invoices.create(
            {
                clienteNombre: invoiceData.clienteNombre,
                clienteTelefono: invoiceData.clienteTelefono,
                clienteEmail: invoiceData.clienteEmail,
                total: invoiceData.total,
                paymentMethod: invoiceData.paymentMethod,
                invoiceNumber: nextInvoiceNumber,
                status:
                    invoiceData.paymentMethod === "cash" ? "paid" : "pending",
                vendorId: invoiceData.vendorId,
                userId: invoiceData.userId,
            },
            { transaction: t }
        );

        // 3. Crear detalles de factura (optimizado)
        const details = invoiceData.invoiceDetails.map((detail) => ({
            id: uuid.v4(),
            invoiceId: newInvoice.id,
            itemId: detail.itemId,
            itemName: detail.itemName,
            itemDescription: detail.itemDescription || "",
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            totalPrice: detail.totalPrice,
            orderType: detail.orderType || "product",
            status: "served",
        }));

        await InvoiceDetail.bulkCreate(details, {
            transaction: t,
            validate: false, // Mejora rendimiento pero asegúrate que los datos son válidos
        });

        // 4. Procesar stock por lotes (optimizado)
        await processStockUpdates(
            invoiceData.invoiceDetails,
            newInvoice.id,
            invoiceData.vendorId,
            t
        );

        return newInvoice;
    });
};

// Función optimizada para manejo de stock
const processStockUpdates = async (
    invoiceDetails,
    invoiceId,
    userId,
    transaction
) => {
    const stockUpdates = [];
    const historyRecords = [];

    for (const detail of invoiceDetails) {
        // Saltar actualización si es stock infinito
        if (detail.infiniteStock) {
            historyRecords.push({
                id: uuid.v4(),
                itemId: detail.itemId,
                departmentId: detail.departmentId,
                quantity: -detail.quantity,
                type: "venta",
                reference: invoiceId,
                userId,
                notes: `Venta factura #${invoiceId} (stock infinito)`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            continue;
        }

        // Proceso normal para items con stock limitado
        const availableStocks = await Stock.findAll({
            where: {
                itemId: detail.itemId,
                departmentId: detail.departmentId,
                quantity: { [Op.gt]: 0 },
            },
            order: [["createdAt", "ASC"]],
            transaction,
        });

        let remainingQty = detail.quantity;

        for (const stock of availableStocks) {
            if (remainingQty <= 0) break;

            const qtyToDeduct = Math.min(remainingQty, stock.quantity);

            stockUpdates.push({
                id: stock.id,
                quantity: stock.quantity - qtyToDeduct,
            });

            historyRecords.push({
                id: uuid.v4(),
                itemId: detail.itemId,
                departmentId: detail.departmentId,
                quantity: -qtyToDeduct,
                type: "venta",
                reference: invoiceId,
                userId,
                notes: `Venta factura #${invoiceId}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            remainingQty -= qtyToDeduct;
        }

        if (remainingQty > 0) {
            throw new Error(
                `Stock insuficiente para ${detail.itemName} después de verificar todos los lotes`
            );
        }
    }

    // Actualización masiva solo para items con stock limitado
    if (stockUpdates.length > 0) {
        await Promise.all(
            stockUpdates.map((update) =>
                Stock.update(
                    { quantity: update.quantity },
                    { where: { id: update.id }, transaction }
                )
            )
        );
    }

    // Registrar todas las operaciones en el historial
    if (historyRecords.length > 0) {
        await InventoryHistory.bulkCreate(historyRecords, { transaction });
    }
};

const createInvoiceRecord = async (data, transaction) => {
    const lastInvoice = await Invoices.findOne({
        order: [["invoiceNumber", "DESC"]],
        transaction,
    });
    const nextNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    return await Invoices.create(
        {
            ...data,
            invoiceNumber: nextNumber,
            status: data.paymentMethod === "cash" ? "paid" : "pending",
        },
        { transaction }
    );
};

const updateStockAndHistory = async (
    details,
    invoiceId,
    userId,
    transaction
) => {
    for (const detail of details) {
        // Actualizar stock
        await Stock.decrement("quantity", {
            by: detail.quantity,
            where: { id: detail.stockId },
            transaction,
        });

        // Registrar en historial
        await InventoryHistory.create(
            {
                itemId: detail.itemId,
                departmentId: detail.departmentId,
                quantity: -detail.quantity,
                type: "venta",
                reference: invoiceId,
                userId,
            },
            { transaction }
        );
    }
};

//hasta aqui lo nuevo

const updateInvoice = async (id, invoiceData) => {
    const invoice = await Invoices.findByPk(id);
    if (!invoice) return null;
    return await invoice.update(invoiceData);
};

const deleteInvoice = async (id) => {
    const invoice = await Invoices.findByPk(id);
    if (!invoice) return null;
    await invoice.destroy();
    return true;
};

module.exports = {
    findAllInvoices,
    findInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    validateStockByDepartment,
    createInvoiceTransaction,
    createInvoiceRecord,
};
