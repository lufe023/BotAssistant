const FavoriteItemsService = require("./favoriteItems.service");

async function addFavoriteItem(req, res) {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;
        const resultado = await FavoriteItemsService.addFavoriteItem(
            userId,
            itemId
        );

        // Si el item ya está en favoritos, retornar un mensaje
        if (resultado.status === 200) {
            return res.status(200).json({ message: resultado.message });
        }

        // Si se agregó correctamente, retornar el nuevo favorito
        res.status(201).json({
            message: resultado.message,
            data: resultado.data,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function removeFavoriteItem(req, res) {
    try {
        const userId = req.user.id;
        const { itemId } = req.query;

        const removed = await FavoriteItemsService.removeFavoriteItem(
            userId,
            itemId
        );
        if (!removed)
            return res.status(404).json({ message: "Favorite item not found" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getFavoriteItemsByUser(req, res) {
    const departmentId = req.query.departmentId;
    try {
        const userId = req.user.id;
        const favoriteItems = await FavoriteItemsService.getFavoriteItemsByUser(
            userId,
            departmentId
        );
        res.status(200).json(favoriteItems);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItemsByUser,
};
