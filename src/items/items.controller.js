// items.controller.js
const ItemsService = require("./items.service");

// Obtener todos los items
async function getAllItems(req, res) {
    try {
        const items = await ItemsService.getAll();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Obtener un item por su ID
async function getItemById(req, res) {
    try {
        const { id } = req.params;
        const item = await ItemsService.getById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Crear un nuevo item
async function createItem(req, res) {
    try {
        const data = req.body;
        const newItem = await ItemsService.create(data);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Actualizar un item
async function updateItem(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedItem = await ItemsService.update(id, data);
        if (!updatedItem)
            return res.status(404).json({ message: "Item not found" });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Eliminar un item
async function deleteItem(req, res) {
    try {
        const { id } = req.params;
        const deleted = await ItemsService.remove(id);
        if (!deleted)
            return res.status(404).json({ message: "Item not found" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const findItemOnTimeController = async (req, res) => {
    let { sWord } = req.body;

    sWord = typeof sWord === "string" ? sWord.trim() : sWord;
    const { departmentId } = req.body;
    // Asegurar que sea string y que no esté vacío después de trim()
    if (typeof sWord !== "string" || !sWord) {
        return res.status(400).json({
            message: "Búsqueda vacía o no válida",
            field: "sWord",
        });
    }

    try {
        console.log("el departamento es", departmentId);
        const data = await ItemsService.findItemOnTimeService(
            sWord,
            departmentId
        );
        res.status(200).json({ data, busqueda: sWord });
    } catch (err) {
        res.status(400).json({ err });
    }
};

const findItemByBarcodeController = async (req, res) => {
    let { sWord } = req.body;

    sWord = typeof sWord === "string" ? sWord.trim() : sWord;

    // Asegurar que sea string y que no esté vacío después de trim()
    if (typeof sWord !== "string" || !sWord) {
        return res.status(400).json({
            message: "Búsqueda vacía o no válida",
            field: "sWord",
        });
    }

    try {
        const data = await ItemsService.findItemOnBybarcodeService(sWord);
        res.status(200).json({ data, busqueda: sWord });
    } catch (err) {
        console.log(err);
        res.status(400).json({ err });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    findItemOnTimeController,
    findItemByBarcodeController,
};
