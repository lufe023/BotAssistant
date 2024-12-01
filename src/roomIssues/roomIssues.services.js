const roomIssuesControllers = require("../controllers/roomIssues.controllers");

const getAllRoomIssues = async (req, res) => {
    try {
        const issues = await roomIssuesControllers.getAllRoomIssues();
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRoomIssueById = async (req, res) => {
    const { id } = req.params;
    try {
        const issue = await roomIssuesControllers.getRoomIssueById(id);
        if (!issue)
            return res.status(404).json({ message: "Room issue not found" });
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRoomIssue = async (req, res) => {
    try {
        const newIssue = await roomIssuesControllers.createRoomIssue(req.body);
        res.status(201).json(newIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRoomIssue = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedIssue = await roomIssuesControllers.updateRoomIssue(
            id,
            req.body
        );
        if (!updatedIssue)
            return res.status(404).json({ message: "Room issue not found" });
        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteRoomIssue = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedIssue = await roomIssuesControllers.deleteRoomIssue(id);
        if (!deletedIssue)
            return res.status(404).json({ message: "Room issue not found" });
        res.status(200).json(deletedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRoomIssues,
    getRoomIssueById,
    createRoomIssue,
    updateRoomIssue,
    deleteRoomIssue,
};
