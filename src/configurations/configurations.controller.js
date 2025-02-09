const configurationsService = require("./configurations.service");

const getConfigurationsById = async (req, res) => {
    const { id } = req.params;
    try {
        const configurations =
            await configurationsService.getConfigurationsById(id);
        res.status(200).json(configurations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getConfigurations = async (req, res) => {
    try {
        const configurations =
            await configurationsService.getAllConfigurations();
        res.status(200).json(configurations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createConfiguration = async (req, res) => {
    try {
        const configuration = await configurationsService.createConfiguration(
            req.body
        );
        res.status(201).json(configuration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateConfiguration = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedConfig = await configurationsService.updateConfiguration(
            id,
            req.body
        );
        res.status(200).json(updatedConfig);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteConfiguration = async (req, res) => {
    try {
        const { id } = req.params;
        await configurationsService.deleteConfiguration(id);
        res.status(204).end();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getSiteInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await configurationsService.getSiteInfo(id);
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getSiteInfo,
    getConfigurationsById,
    getConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
};
