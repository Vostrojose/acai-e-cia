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

/*
=================================
MIDDLEWARES GLOBAIS
=================================
*/

app.use(cors());
app.use(express.json());
app.use(httpLogger);

/*
=================================
ROTAS PRINCIPAIS
=================================
*/

app.use("/api", pedidoRoutes);
app.use("/api", produtoRoutes);
app.use("/api", authRoutes);
app.use("/api", pagamentoRoutes);

/*
=================================
ROTA DE TESTE
=================================
*/

app.get("/", (req, res) => {
  return res.json({
    message: "API Açaí & Cia funcionando 🚀"
  });
});

/*
=================================
MIDDLEWARE DE ERRO
=================================
*/

app.use(errorMiddleware);

/*
=================================
SERVIDOR HTTP
=================================
*/

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

/*
=================================
WEBSOCKET
=================================
*/

initSocket(server);

/*
=================================
INICIAR SERVIDOR
=================================
*/

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});