import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import { generateToken } from '../utils/jwt';
class AuthService {
    async login(email, senha) {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new AppError('Credenciais inválidas.', 401);
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new AppError('Credenciais inválidas.', 401);
        }
        const token = generateToken({
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
export default new AuthService();
