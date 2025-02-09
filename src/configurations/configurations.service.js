const Configurations = require("../models/configurations.models");

const getConfigurationsById = async (id) => {
    return await Configurations.findByPk(id);
};
const getAllConfigurations = async () => {
    return await Configurations.findAll();
};

const createConfiguration = async (data) => {
    return await Configurations.create(data);
};

const updateConfiguration = async (id, data) => {
    const config = await Configurations.findByPk(id);
    if (!config) throw new Error("Configuration not found");
    return await config.update(data);
};

const deleteConfiguration = async (id) => {
    const config = await Configurations.findByPk(id);
    if (!config) throw new Error("Configuration not found");
    await config.destroy();
};

const getSiteInfo = async (id) => {
    const config = await Configurations.findOne({
        attributes: ["businessName", "slogan", "address", "logoUrl"],

        where: { id },
    });
    if (!config) throw new Error("Configuration not found");
    return config;
};

module.exports = {
    getSiteInfo,
    getConfigurationsById,
    getAllConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
};
