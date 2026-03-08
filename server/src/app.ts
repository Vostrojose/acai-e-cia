import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

// middlewares globais
app.use(express.json());

// rotas
app.use("/api", authRoutes);

export default app;