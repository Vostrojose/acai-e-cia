"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
function ensureAuthenticated(request, _response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new AppError_1.AppError('Token não informado.', 401);
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        throw new AppError_1.AppError('Token mal formatado.', 401);
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        throw new AppError_1.AppError('Token mal formatado.', 401);
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        request.user = {
            id: decoded.id,
            role: decoded.role,
        };
        return next();
    }
    catch (err) {
        throw new AppError_1.AppError('Token inválido.', 401);
    }
}
