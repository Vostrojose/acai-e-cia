import express, { Application } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import pedidoRoutes from "./routes/pedido.routes";
import produtoRoutes from "./routes/produto.routes";
import pagamentoRoutes from "./routes/pagamento.routes";

const app: Application = express();

/* ========================= */
/* MIDDLEWARES               */
/* ========================= */

// JSON
app.use(express.json());

// CORS
app.use(
  cors({
    origin: [
      "https://pedido.acaiecompanhia.com.br",
      "https://admin.acaiecompanhia.com.br",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 🔥 ESSENCIAL PRA PRE-FLIGHT (resolve bloqueio do DevTools)
app.options("*", cors());

/* ========================= */
/* ROTAS                     */
/* ========================= */

app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidoRoutes); // ✅ corrigido
app.use("/api/produtos", produtoRoutes);
app.use("/api/pagamento", pagamentoRoutes);

/* ========================= */
/* TESTE API                 */
/* ========================= */

app.get("/", (req, res) => {
  res.send("API Açaí & Cia rodando 🚀");
});

export default app;