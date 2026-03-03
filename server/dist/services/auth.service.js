"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
class AuthService {
    async login(email, senha) {
        const usuario = await prisma_1.default.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new AppError_1.AppError('Credenciais inválidas.', 401);
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new AppError_1.AppError('Credenciais inválidas.', 401);
        }
        const token = (0, jwt_1.generateToken)({
            id: usuario.id,
            role: usuario.role,
        });
        return {
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
            token,
        };
    }
}
exports.default = new AuthService();
