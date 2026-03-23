import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import pedidoRoutes from "./routes/pedido.routes";
import produtoRoutes from "./routes/produto.routes";
import authRoutes from "./routes/auth.routes";
import pagamentoRoutes from "./routes/pagamento.routes";

import { errorMiddleware } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/logger.middleware";
import { initSocket } from "./websocket/socket";

dotenv.config();

const app = express();

/* =================================
   MIDDLEWARES GLOBAIS
================================= */

// Configuração do CORS
app.use(
  cors({
    origin: [
      "https://acai-e-cia-admin-fy6kdh17d-jose-m-da-silvas-projects.vercel.app",
      "https://pedido.acaiecompanhia.com.br",
      "http://localhost:5173",   // front-end local
      "http://127.0.0.1:5173",   // suporte IP local
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // apenas se usar cookies/sessão
  })
);

app.use(express.json());
app.use(httpLogger);

/* =================================
   ROTAS PRINCIPAIS
================================= */

// Aqui usamos prefixos específicos, então dentro dos arquivos de rotas
// os caminhos devem ser relativos ("/", "/:id", etc.)
app.use("/api/pedido", pedidoRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pagamento", pagamentoRoutes);

/* =================================
   ROTA DE TESTE
================================= */
app.get("/", (req, res) => {
  return res.json({
    message: "API Açaí & Cia funcionando corretamente! 🚀",
  });
});

/* =================================
   MIDDLEWARE DE ERRO
================================= */
app.use(errorMiddleware);

/* =================================
   SERVIDOR HTTP
================================= */
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

/* =================================
   WEBSOCKET
================================= */
initSocket(server);

/* =================================
   INICIAR SERVIDOR
================================= */
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
