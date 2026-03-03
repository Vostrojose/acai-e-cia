"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
        },
    });
    io.on('connection', (socket) => {
        console.log('🔌 Cliente conectado:', socket.id);
        socket.on('disconnect', () => {
            console.log('❌ Cliente desconectado:', socket.id);
        });
    });
}
function getIO() {
    if (!io) {
        throw new Error('Socket.io não inicializado');
    }
    return io;
}
