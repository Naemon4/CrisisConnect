// src/routes/watsonTools.ts

import { Router, Request, Response } from 'express'
import { Voluntario } from '../models/Voluntario'
import { Op } from 'sequelize'

const router = Router()

// Tool 1 — buscar voluntários por habilidades
router.post('/tools/buscar-voluntarios', async (req: Request, res: Response) => {
    const { habilidades, quantidade } = req.body

    const voluntarios = await Voluntario.findAll({
        where: {
            status: 'livre',
            habilidades: { [Op.overlap]: habilidades }, // PostgreSQL array overlap
        },
        limit: quantidade * 3, // retorna mais pra IA filtrar
    })

    res.json({ voluntarios })
})

// Tool 2 — atualizar status do voluntário
router.post('/tools/atualizar-status', async (req: Request, res: Response) => {
    const { voluntario_id, status } = req.body

    await Voluntario.update({ status }, { where: { id: voluntario_id } })

    res.json({ success: true })
})

// Tool 3 — notificar voluntário
router.post('/tools/notificar-voluntario', async (req: Request, res: Response) => {
    const { voluntario_id, acao_id, mensagem } = req.body

    // aqui você salva a notificação no banco
    // futuramente pode mandar email também

    res.json({ success: true, mensagem: 'Voluntário notificado' })
})

export default router