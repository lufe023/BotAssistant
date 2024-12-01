// socketManager.js
let io = null; // Instancia de Socket.IO
let connectedUsers = new Map(); // Mapa de usuarios conectados

const setIoInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

const addConnectedUser = (userId, socketId) => {
    connectedUsers.set(userId, socketId);
};

const removeConnectedUser = (socketId) => {
    for (const [userId, id] of connectedUsers.entries()) {
        if (id === socketId) {
            connectedUsers.delete(userId);
            break;
        }
    }
};

const getConnectedUsers = () => connectedUsers;

const getSocketIoInstance = () => io;

module.exports = {
    setIoInstance,
    addConnectedUser,
    removeConnectedUser,
    getConnectedUsers,
    getSocketIoInstance,
};
