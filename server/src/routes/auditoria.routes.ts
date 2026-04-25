import { Router } from "express"
import AuditoriaService from "../services/auditoria.service"

const router = Router()

/* ============================= */
/* GET AUDITORIA                 */
/* ============================= */

router.get("/", async (req, res) => {
  try {
    const data = await AuditoriaService.obterDados()

    return res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error("Erro auditoria:", error)

    return res.status(500).json({
      success: false,
      message: "Erro ao carregar auditoria"
    })
  }
})

/* ============================= */
/* REGISTRAR VENDA MANUAL        */
/* ============================= */

router.post("/venda", async (req, res) => {
  try {
    const { produto } = req.body

    if (!produto) {
      return res.status(400).json({
        success: false,
        message: "Produto é obrigatório"
      })
    }

    // Simulação simples (caso queira manter botão funcionando)
    console.log("Venda manual registrada:", produto)

    return res.json({
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao registrar venda"
    })
  }
})

export default router