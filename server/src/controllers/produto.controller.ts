import { Request, Response } from 'express'
import produtoService from '../services/produto.service'
import { asyncHandler } from '../utils/asyncHandler'
import { criarProdutoSchema } from '../validators/produto.schema'
import { AppError } from '../utils/AppError'
import prisma from '../services/prisma'
import { serializeDecimal } from '../utils/serializeDecimal'

class ProdutoController {
  /* ============================= */
  /* CRIAR                         */
  /* ============================= */
criar = asyncHandler(async (req: Request, res: Response) => {
  const arquivo = req.file;

  const imagemUpload = arquivo
    ? `${req.protocol}://${req.get("host")}/uploads/produtos/${arquivo.filename}`
    : undefined;

  const body = {
    ...req.body,
    preco: Number(req.body.preco),
    ativo: req.body.ativo === "true",

    disponivelDom: req.body.disponivelDom === "true",
    disponivelSeg: req.body.disponivelSeg === "true",
    disponivelTer: req.body.disponivelTer === "true",
    disponivelQua: req.body.disponivelQua === "true",
    disponivelQui: req.body.disponivelQui === "true",
    disponivelSex: req.body.disponivelSex === "true",
    disponivelSab: req.body.disponivelSab === "true",

    imagem: imagemUpload || req.body.imagem || undefined,
  };

  const data = criarProdutoSchema.parse(body);

  const produto = await produtoService.criarProduto(data);

  return res.status(201).json({
    success: true,
    data: serializeDecimal(produto),
  });
});

  /* ============================= */
  /* LISTAR                        */
  /* ============================= */
  listar = asyncHandler(async (req: Request, res: Response) => {
    const produtos = await produtoService.listarProdutos()

    console.log('📦 PRODUTOS:', produtos)

    return res.json({
      success: true,
      data: produtos,
    })
  })

  /* ============================= */
  /* 🔥 NOVO: BUSCAR POR ID        */
  /* ============================= */
  buscarPorId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        adicionais: true,
        variacoes: true,
      },
    })

    if (!produto) {
      throw new AppError('Produto não encontrado', 404)
    }

    return res.json({
      success: true,
      data: serializeDecimal(produto),
    })
  })

  /* ============================= */
  /* ALTERAR STATUS                */
  /* ============================= */
  alterarStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { ativo } = req.body

    if (typeof ativo !== 'boolean') {
      throw new AppError('O campo "ativo" deve ser boolean.', 400)
    }

    const produto = await produtoService.alterarStatus(id, ativo)

    return res.json({
      success: true,
      data: serializeDecimal(produto),
    })
  })

  /* ============================= */
  /* REMOVER                       */
  /* ============================= */
  remover = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    await produtoService.removerProduto(id)

    return res.json({
      success: true,
    })
  })

  /* ============================= */
  /* ATUALIZAR                     */
  /* ============================= */
/* ============================= */
/* ATUALIZAR                     */
/* ============================= */
atualizar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const arquivo = req.file

  const dadosAtualizacao: Record<string, unknown> = {
    ...req.body,
  }

  // Se um novo arquivo foi enviado, atualiza a imagem.
  // Caso contrário, preserva a imagem já existente.
  if (arquivo) {
    dadosAtualizacao.imagem = `${req.protocol}://${req.get(
      'host',
    )}/uploads/produtos/${arquivo.filename}`
  }

  // Quando a requisição vier como multipart/form-data,
  // valores booleanos chegam como texto.
  const camposBooleanos = [
    'ativo',
    'disponivelDom',
    'disponivelSeg',
    'disponivelTer',
    'disponivelQua',
    'disponivelQui',
    'disponivelSex',
    'disponivelSab',
  ]

  for (const campo of camposBooleanos) {
    if (campo in dadosAtualizacao) {
      const valor = dadosAtualizacao[campo]

      if (valor === 'true' || valor === true) {
        dadosAtualizacao[campo] = true
      } else if (valor === 'false' || valor === false) {
        dadosAtualizacao[campo] = false
      }
    }
  }

  if ('preco' in dadosAtualizacao) {
    dadosAtualizacao.preco = Number(dadosAtualizacao.preco)
  }

  // Não permite que um campo vazio apague a imagem existente.
  if (
    'imagem' in dadosAtualizacao &&
    typeof dadosAtualizacao.imagem === 'string' &&
    dadosAtualizacao.imagem.trim() === ''
  ) {
    delete dadosAtualizacao.imagem
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: dadosAtualizacao,
  })

  return res.json({
    success: true,
    data: serializeDecimal(produto),
  })
})

  /* ============================= */
  /* DELETAR                       */
  /* ============================= */
  deletar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    await prisma.produto.delete({
      where: { id },
    })

    return res.json({
      success: true,
    })
  })
}

export default new ProdutoController()
