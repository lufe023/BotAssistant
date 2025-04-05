// controllers/invoices.controllers.js
const Items = require("../models/items.models");
const { getUserById } = require("../users/users.controllers");
const invoicesServices = require("./invoices.services");

const getAllInvoices = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validación básica de fechas
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: "Los parámetros startDate y endDate son requeridos.",
            });
        }

        const invoices = await invoicesServices.findAllInvoices(
            startDate,
            endDate
        );
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await invoicesServices.findInvoiceById(id);
        if (!invoice)
            return res.status(404).json({ message: "Invoice not found" });
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para verificar permisos de asignación de vendedor
const canAssignVendor = (user) => {
    const allowedRoles = [
        "Administrator",
        "gerente",
        "supervisor",
        "auxiliar_administrativo",
    ];
    return allowedRoles.includes(user.user_role?.roleName);
};

// Manejador de errores para facturas
const handleInvoiceError = (res, error) => {
    console.error("Error en facturación:", error);

    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
            error: "Error de validación",
            details: error.errors.map((e) => e.message),
        });
    }

    res.status(500).json({
        error: error.message || "Error interno al procesar la factura",
    });
};

const createInvoice = async (req, res) => {
    try {
        const { cliente, total, invoiceDetails, paymentMethod } = req.body;

        // Verificar permisos del usuario
        const user = await getUserById(req.user.id);
        const vendorId = canAssignVendor(user)
            ? req.body.vendor || req.user.id
            : req.user.id;

        // Obtener información de infiniteStock para cada item
        const enhancedDetails = await Promise.all(
            invoiceDetails.map(async (detail) => {
                const item = await Items.findByPk(detail.itemId, {
                    attributes: ["infiniteStock"],
                });
                return {
                    ...detail,
                    orderType: detail.orderType || "product",
                    infiniteStock: item?.infiniteStock || false,
                };
            })
        );

        // Validar stock (ignora los que tienen infiniteStock)
        const stockValidation =
            await invoicesServices.validateStockByDepartment(enhancedDetails);
        if (!stockValidation.valid) {
            return res.status(400).json({
                error: "Problemas con el inventario",
                errors: stockValidation.errors,
            });
        }

        // Crear factura
        const newInvoice = await invoicesServices.createInvoiceTransaction({
            clienteNombre: cliente.firstName || "Consumidor Final",
            clienteTelefono: cliente.telefono || "",
            clienteEmail: cliente.email || "",
            total,
            paymentMethod,
            invoiceDetails: enhancedDetails,
            vendorId,
            userId: cliente.id || null,
        });

        res.status(201).json(newInvoice);
    } catch (error) {
        handleInvoiceError(res, error);
    }
};

const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInvoice = await invoicesServices.updateInvoice(
            id,
            req.body
        );
        if (!updatedInvoice)
            return res.status(404).json({ message: "Invoice not found" });
        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await invoicesServices.deleteInvoice(id);
        if (!deleted)
            return res.status(404).json({ message: "Invoice not found" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};
