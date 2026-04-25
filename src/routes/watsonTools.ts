// src/routes/watsonTools.ts

import { Router, Request, Response } from 'express'
import { Volunteer } from '../models/Volunteer'
import { Op } from 'sequelize'
import { Status } from '../enums/Status'

const router = Router()

// Tool 1 — buscar voluntários por habilidades
router.post('/tools/buscar-voluntarios', async (req: Request, res: Response) => {
  try {
    const { habilidades, quantidade } = req.body

    const voluntarios = await Volunteer.findAll({
      where: {
        status: Status.Ativo, // usa o enum correto
        skills: { [Op.overlap]: habilidades },
      },
      limit: quantidade * 3,
    })

    res.json({ voluntarios })
  } catch (error: any) {
    console.error('[WatsonTools] Erro ao buscar voluntários:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Tool 2 — atualizar status do voluntário
router.post('/tools/atualizar-status', async (req: Request, res: Response) => {
  try {
    const { voluntario_id, status } = req.body

    await Volunteer.update({ status }, { where: { id: voluntario_id } })

    res.json({ success: true })
  } catch (error: any) {
    console.error('[WatsonTools] Erro ao atualizar status:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Tool 3 — notificar voluntário
router.post('/tools/notificar-voluntario', async (req: Request, res: Response) => {
  try {
    const { voluntario_id, acao_id, mensagem } = req.body

    // aqui você salva a notificação no banco
    // futuramente pode mandar email também

    res.json({ success: true, mensagem: 'Voluntário notificado' })
  } catch (error: any) {
    console.error('[WatsonTools] Erro ao notificar voluntário:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router