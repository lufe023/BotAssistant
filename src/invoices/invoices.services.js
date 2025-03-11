// services/invoices.services.js
const Invoices = require("../models/invoice.models");
const InvoiceDetail = require("../models/invoiceDetail.models");
const Items = require("../models/items.models");
const Users = require("../models/users.models");
const { Sequelize, Op } = require("sequelize");
const uuid = require("uuid");

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
};
