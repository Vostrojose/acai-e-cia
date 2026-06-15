import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import http from 'http'

import pedidoRoutes from './routes/pedido.routes'
import produtoRoutes from './routes/produto.routes'
import authRoutes from './routes/auth.routes'
import pagamentoRoutes from './routes/pagamento.routes'

import { errorMiddleware } from './middlewares/error.middleware'
import { httpLogger } from './middlewares/logger.middleware'
import { initSocket } from './websocket/socket'

import adicionalRoutes from './routes/adicional.routes'
import variacaoRoutes from './routes/variacao.routes'
import auditoriaRoutes from './routes/auditoria.routes'
import balcaoRoutes from './routes/balcao.routes'
import clienteRoutes from './routes/cliente.routes'
import dashboardRoutes from './routes/dashboard.routes'
import configuracoesRoutes from './routes/configuracoes'
import relatorioRoutes from './routes/relatorio.routes'
import relatorioScheduler from './services/relatorio.scheduler'
import propagandaRoutes from './routes/propaganda.routes'
import playlistRoutes from './routes/playlist.routes'
import playlistItemRoutes from './routes/playlist-item.routes'
import tvRoutes from './routes/tv.routes'
import playerRoutes from './routes/player.routes'
import path from 'path'

const app = express()

/* =================================
   MIDDLEWARES GLOBAIS
================================= */

const corsOptions = {
  origin: [
    'https://pedido.acaiecompanhia.com.br',
    'https://admin.acaiecompanhia.com.br',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
app.set('trust proxy', true)

app.use(cors(corsOptions))

// 🔥 preflight usando MESMA config
app.options('*', cors(corsOptions))

app.use(express.json({ limit: '1mb' }))
app.use(httpLogger)

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

/* =================================
   ROTAS PRINCIPAIS
================================= */
app.use('/api/configuracoes', configuracoesRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/produtos', produtoRoutes)
app.use('/api/pagamento', pagamentoRoutes)

app.use('/api/balcao', balcaoRoutes)
app.use('/api/dashboard-financeiro', dashboardRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/adicionais', adicionalRoutes)
app.use('/api/variacoes', variacaoRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/relatorios', relatorioRoutes)
app.use('/api/propagandas', propagandaRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/tvs', tvRoutes)
app.use('/api/tv/player', playerRoutes)
app.use('/api/playlists', playlistItemRoutes)


/* =================================
   HEALTH CHECK
================================= */

app.get('/', (req, res) => {
  return res.json({
    message: 'API Açaí & Cia funcionando corretamente! 🚀',
  })
})

/* =================================
   MIDDLEWARE DE ERRO (SEMPRE ÚLTIMO)
================================= */

app.use(errorMiddleware)

/* =================================
   SERVIDOR HTTP
================================= */

const PORT = process.env.PORT || 3000
const server = http.createServer(app)

/* =================================
   WEBSOCKET
================================= */

initSocket(server)

/* =================================
   INICIAR SERVIDOR
================================= */

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)

  relatorioScheduler.iniciar()
})
