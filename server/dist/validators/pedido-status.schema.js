"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarStatusSchema = void 0;
const zod_1 = require("zod");
exports.atualizarStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'RECEBIDO',
        'EM_PREPARO',
        'PRONTO',
        'ENTREGUE',
        'CANCELADO',
    ]),
});
