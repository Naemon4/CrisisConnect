// src/controllers/NotificacaoController.ts

import { Request, Response } from 'express'
import notificacaoService from '../services/NotificacaoService'

class NotificacaoController {

  // POST /notificacoes
  async criar(req: Request, res: Response) {
    try {
      const { voluntario_id, acao_id } = req.body
      const notificacao = await notificacaoService.criar(Number(voluntario_id), Number(acao_id))
      res.status(201).json(notificacao)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  // GET /notificacoes/volunteer/:id
  async buscarPorVoluntario(req: Request, res: Response) {
    try {
      const notificacoes = await notificacaoService.buscarPorVoluntario(Number(req.params.id))
      res.json(notificacoes)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  // PUT /notificacoes/:id/responder
  async responder(req: Request, res: Response) {
    try {
      const { status } = req.body
      if (!['aceito', 'recusado'].includes(status)) {
        res.status(400).json({ error: 'Status deve ser aceito ou recusado' })
        return
      }
      const notificacao = await notificacaoService.responder(Number(req.params.id), status)
      res.json(notificacao)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const notificacao = await notificacaoService.deletar(Number(req.params.id))
      res.json(notificacao)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}

export default new NotificacaoController()