// controllers/invoices.controllers.js
const invoicesServices = require("./invoices.services");

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await invoicesServices.findAllInvoices();
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
        const newInvoice = await invoicesServices.createInvoice(req.body);
        res.status(201).json(newInvoice);
    } catch (error) {
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
