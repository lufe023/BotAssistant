// services/invoices.services.js
const Invoices = require("../models/invoice.models");
const InvoiceDetail = require("../models/invoiceDetail.models");
const Items = require("../models/items.models");
const Users = require("../models/users.models");

const findAllInvoices = async () => {
    return await Invoices.findAll({
        include: [
            {
                model: InvoiceDetail,
                include: [Items],
            },
            {
                model: Users,
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
                attributes: { exclude: ["password"] },
            },
        ],
    });
};

const createInvoice = async (invoiceData) => {
    return await Invoices.create(invoiceData, {
        include: [InvoiceDetail],
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
