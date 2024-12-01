//notifications.service.js
const notificationsControllers = require("./notifications.controllers");

const getAllNotifications = (req, res) => {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;

    const urlBase = `${req.protocol}://${req.get("host")}/api/v1/notifications`;

    notificationsControllers
        .getAllNotifications(offset, limit)
        .then((data) => {
            const nextPage =
                data.count - offset > limit
                    ? `${urlBase}?offset=${offset + limit}&limit=${limit}`
                    : null;
            res.status(200).json({
                next: nextPage,
                prev:
                    offset > 0
                        ? `${urlBase}?offset=${Math.max(
                              offset - limit,
                              0
                          )}&limit=${limit}`
                        : null,
                offset,
                limit,
                count: data.count,
                results: data.rows,
            });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const getNotificationById = (req, res) => {
    const { id } = req.params;
    notificationsControllers
        .getNotificationById(id)
        .then((notification) => {
            if (notification) {
                res.status(200).json(notification);
            } else {
                res.status(404).json({ message: "Notification not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const getMyNotifications = (req, res) => {
    const { id } = req.user;

    notificationsControllers
        .getNotificationByuser(id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};
const createNotification = (req, res) => {
    notificationsControllers
        .createNotification(req.body)
        .then((notification) => {
            res.status(201).json(notification);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const updateNotification = (req, res) => {
    const { id } = req.params;
    notificationsControllers
        .updateNotification(id, req.body)
        .then((updatedNotification) => {
            if (updatedNotification) {
                res.status(200).json(updatedNotification);
            } else {
                res.status(404).json({ message: "Notification not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const deleteNotification = (req, res) => {
    const { id } = req.params;
    notificationsControllers
        .deleteNotification(id)
        .then((deleted) => {
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Notification not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

module.exports = {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    getMyNotifications,
};
