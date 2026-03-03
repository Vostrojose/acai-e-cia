import { Server } from 'socket.io'
import http from 'http'

let io: Server | null = null

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id)

    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id)
    })
  })
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io não inicializado')
  }
  return io
}
