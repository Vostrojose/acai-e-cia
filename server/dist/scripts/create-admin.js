"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createAdmin() {
    const email = 'admin@acai.com';
    const senha = '123456';
    const senhaHash = await bcryptjs_1.default.hash(senha, 10);
    const usuarioExistente = await prisma_1.default.usuario.findUnique({
        where: { email },
    });
    if (usuarioExistente) {
        console.log('Usuário já existe.');
        process.exit(0);
    }
    const usuario = await prisma_1.default.usuario.create({
        data: {
            nome: 'Administrador',
            email,
            senha: senhaHash,
            role: 'ADMIN',
        },
    });
    console.log('Admin criado com sucesso:');
    console.log(usuario);
    process.exit(0);
}
createAdmin();
