import { Server } from 'socket.io';
let io = null;
export function initSocket(server) {
    io = new Server(server, {
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
export function getIO() {
    if (!io) {
        throw new Error('Socket.io não inicializado');
    }
    return io;
}
