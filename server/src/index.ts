import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'

import pedidoRoutes from './routes/pedido.routes'
import produtoRoutes from './routes/produto.routes'
import authRoutes from './routes/auth.routes'
import pagamentoRoutes from './routes/pagamento.routes'

import { errorMiddleware } from './middlewares/error.middleware'
import { httpLogger } from './middlewares/logger.middleware'
import { initSocket } from './websocket/socket'

dotenv.config()

const app = express()

// Middlewares globais
app.use(cors())
app.use(express.json())
app.use(httpLogger)

// Rotas principais
app.use('/api', pedidoRoutes)
app.use('/api', produtoRoutes)
app.use('/api', authRoutes)
app.use('/api', pagamentoRoutes)

// Rota de teste
app.get('/', (req, res) => {
  return res.json({
    message: 'API Açaí & Cia funcionando 🚀',
    version: "LOGIN_DEBUG_1"
  })
})

// Middleware de erro (sempre por último)
app.use(errorMiddleware)

const PORT = process.env.PORT || 3000

// 🔌 Criar servidor HTTP uma única vez
const server = http.createServer(app)

// 🔌 Inicializar WebSocket
initSocket(server)

// 🚀 Subir servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})
