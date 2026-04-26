// src/services/AcaoCriseService.ts

import { AcaoCrise, AcaoCriseAttributes } from '../models/AcaoCrise'
import { Enterprise } from '../models/Enterprise'
import { Volunteer } from '../models/Volunteer'
import { notifyEnterprise } from './notificationService'
import { WatsonxService } from './WatsonxService'

const watson = new WatsonxService()

export class AcaoCriseService {

  async criar(data: Omit<AcaoCriseAttributes, 'id' | 'voluntarios_ativos' | 'status'>): Promise<AcaoCrise> {
    return await AcaoCrise.create(data)
  }

  async buscarPorId(id: number): Promise<AcaoCrise | null> {
    return await AcaoCrise.findByPk(id)
  }

  async buscarPorEmpresa(empresa_id: number): Promise<AcaoCrise[]> {
    return await AcaoCrise.findAll({ where: { empresa_id } })
  }

  async atualizar(id: number, data: Partial<AcaoCriseAttributes>): Promise<AcaoCrise | null> {
    const acao = await AcaoCrise.findByPk(id)
    if (!acao) return null
    return await acao.update(data)
  }

  async deletar(id: number): Promise<boolean> {
    const acao = await AcaoCrise.findByPk(id)
    if (!acao) return false
    await acao.destroy()
    return true
  }

  async orquestrar(id: number): Promise<any | null> {
    const acao = await AcaoCrise.findByPk(id)
    if (!acao) return null

    const resultado = await watson.orquestrarAcao(
      acao.habilidades_necessarias,
      acao.numero_voluntarios_necessarios
    )

    // atualiza status para em_andamento após orquestrar
    await acao.update({ status: 'em_andamento' })

    return resultado
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
 
    // Notifica a empresa via webhook
    if (enterprise.webhookUrl) {
      await notifyEnterprise(
        enterprise.webhookUrl as string,
        acao.id,
        volunteer.id,
        volunteer.fullName as string
      )
    }
 
    return acao
  }
}