// controllers/invoices.controllers.js
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

const createInvoice = async (req, res) => {
    try {
        const { cliente, total, invoiceDetails, paymentMethod } = req.body;

        //funcion incompleta, se necisita
        const roles = await getUserById(req.user.id);

        const hasPermission = [
            "Administrator",
            "gerente",
            "supervisor",
            "auxiliar_administrativo",
        ].includes(roles.user_role.roleName);

        let vendorId = "";
        if (hasPermission) {
            vendorId = req.body.vendor || req.user.id;
        } else {
            vendorId = req.user.id;
        }

        if (!invoiceDetails || invoiceDetails.length === 0) {
            return res
                .status(400)
                .json({ error: "La factura no tiene productos" });
        }

        const newInvoice = await invoicesServices.createInvoice({
            clienteNombre: cliente.firstName,
            clienteTelefono: cliente.telefono,
            clienteEmail: cliente.email,
            userId: cliente.id,
            paymentMethod,
            total,
            invoiceDetails,
            vendorId,
        });

        res.status(201).json(roles);
    } catch (error) {
        console.error("Error al crear la factura:", error);
        res.status(500).json({ error: error.message });
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
