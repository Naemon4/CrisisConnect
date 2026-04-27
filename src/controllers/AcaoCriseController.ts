// src/controllers/AcaoCriseController.ts

import { Request, Response } from 'express'
import { AcaoCriseService } from '../services/AcaoCriseService'
import { AcaoCrise, AcaoCriseAttributes } from '../models/AcaoCrise'
import { Volunteer } from '../models/Volunteer'
import { Enterprise } from '../models/Enterprise'

const service = new AcaoCriseService()


export class AcaoCriseController {

  // POST /acoes
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const acao = await service.criar(req.body)
      res.status(201).json(acao)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar ação de crise' })
    }
  }

  // GET /acoes/:id
  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const acao = await service.buscarPorId(Number(req.params['id']))
      if (!acao) {
        res.status(404).json({ error: 'Ação não encontrada' })
        return
      }
      res.json(acao)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ação de crise' })
    }
  }

  // GET /acoes/empresa/:empresa_id
  async buscarPorEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const acoes = await service.buscarPorEmpresa(Number(req.params['empresa_id']))
      res.json(acoes)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ações da empresa' })
    }
  }

  // PUT /acoes/:id
  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const acao = await service.atualizar(Number(req.params['id']), req.body)
      if (!acao) {
        res.status(404).json({ error: 'Ação não encontrada' })
        return
      }
      res.json(acao)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar ação de crise' })
    }
  }

  // DELETE /acoes/:id
  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const deletado = await service.deletar(Number(req.params['id']))
      if (!deletado) {
        res.status(404).json({ error: 'Ação não encontrada' })
        return
      }
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar ação de crise' })
    }
  }

  // POST /acoes/:id/orchestrate
  async orquestrar(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await service.orquestrar(Number(req.params['id']))
      if (!resultado) {
        res.status(404).json({ error: 'Ação não encontrada' })
        return
      }
      res.json({ resultado })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao orquestrar ação de crise' })
    }
  }

  async aceitarAcao(acaoId: number, volunteerId: number): Promise<AcaoCrise> {
    const acao = await AcaoCrise.findByPk(acaoId)
    if (!acao) throw new Error('Ação de crise não encontrada')
    if (acao.status === 'concluida') throw new Error('Ação de crise já concluída')

    const volunteer = await Volunteer.findByPk(volunteerId)
    if (!volunteer) throw new Error('Voluntário não encontrado')

    const enterprise = await Enterprise.findByPk(acao.empresa_id)
    if (!enterprise) throw new Error('Empresa não encontrada')

    // Incrementa voluntários ativos
    const novosVoluntarios = acao.voluntarios_ativos + 1
    const novoStatus = novosVoluntarios >= acao.numero_voluntarios_necessarios
      ? 'concluida'
      : 'em_andamento'

    await acao.update({
      voluntarios_ativos: novosVoluntarios,
      status: novoStatus,
    })

    return acao
  }

  async sairDaAcao(req: Request, res: Response): Promise<void> {
    try {
      const { voluntario_id } = req.body
      await service.sairDaAcao(Number(req.params['id']), Number(voluntario_id))
      res.json({ success: true })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async buscarPorVoluntario(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const acoes = await service.buscarPorVoluntario(Number(id))
    res.json(acoes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ações' })
  }
}

}