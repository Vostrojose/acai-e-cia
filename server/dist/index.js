"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const pedido_routes_1 = __importDefault(require("./routes/pedido.routes"));
const produto_routes_1 = __importDefault(require("./routes/produto.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const pagamento_routes_1 = __importDefault(require("./routes/pagamento.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const socket_1 = require("./websocket/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_middleware_1.httpLogger);
// Rotas principais
app.use('/api', pedido_routes_1.default);
app.use('/api', produto_routes_1.default);
app.use('/api', auth_routes_1.default);
app.use('/api', pagamento_routes_1.default);
// Rota de teste
app.get('/', (req, res) => {
    return res.json({
        message: 'API Açaí & Cia funcionando 🚀',
    });
});
// Middleware de erro (sempre por último)
app.use(error_middleware_1.errorMiddleware);
const PORT = process.env.PORT || 3000;
// 🔌 Criar servidor HTTP uma única vez
const server = http_1.default.createServer(app);
// 🔌 Inicializar WebSocket
(0, socket_1.initSocket)(server);
// 🚀 Subir servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
