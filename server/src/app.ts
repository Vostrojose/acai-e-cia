import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

// middlewares globais
app.use(express.json());

// rotas
app.use("/api/auth", authRoutes);

export default app;