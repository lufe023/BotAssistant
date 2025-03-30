const stockService = require("./stock.service");

const getAllStock = async (req, res) => {
    try {
        const stocks = await stockService.getAllStock();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStockById = async (req, res) => {
    try {
        const stock = await stockService.getStockById(req.params.id);
        if (!stock)
            return res.status(404).json({ message: "Stock no encontrado" });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createStock = async (req, res) => {
    try {
        if (!req.body.quantity || req.body.quantity < 1) {
            return res.status(400).json({
                error: "Debe especificar una Cantidada a sumar, es requerido y debe ser mayor a 0",
            });
        } else {
            const newStock = await stockService.createStock(req.body);
            res.status(201).json(newStock);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const updatedStock = await stockService.updateStock(
            req.params.id,
            req.body
        );
        if (!updatedStock)
            return res.status(404).json({ message: "Stock no encontrado" });
        res.json(updatedStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStock = async (req, res) => {
    try {
        const deleted = await stockService.removeStock(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: "Stock no encontrado" });
        res.json({ message: "Stock eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllStock,
    getStockById,
    createStock,
    updateStock,
    deleteStock,
};
