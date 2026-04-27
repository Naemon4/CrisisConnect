// src/services/AcaoCriseService.ts

import { AcaoCrise, AcaoCriseAttributes } from '../models/AcaoCrise'
import { WatsonxService } from './WatsonxService'
import { Volunteer } from '../models/Volunteer'
import { Op } from 'sequelize'
import { Enterprise } from '../models/Enterprise'

const watson = new WatsonxService()

export class AcaoCriseService {

  async criar(data: Omit<AcaoCriseAttributes, 'id' | 'voluntarios_ativos' | 'status'>): Promise<AcaoCrise> {
    return await AcaoCrise.create(data)
  }

  async buscarPorId(id: number): Promise<AcaoCrise | null> {
    return await AcaoCrise.findByPk(id, {
      include: [{ model: Enterprise, as: 'empresa' }]
    })
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

  async sairDaAcao(acao_id: number, voluntario_id: number): Promise<void> {
    const acao = await AcaoCrise.findByPk(acao_id)
    if (!acao) throw new Error('Ação não encontrada')

    const ids = (acao.voluntarios_ids || []).filter((id: number) => id !== voluntario_id)
    await acao.update({
      voluntarios_ids: ids,
      voluntarios_ativos: Math.max(0, acao.voluntarios_ativos - 1),
    })

    await Volunteer.update({ status: 'ATIVO' }, { where: { id: voluntario_id } })
  }

  async buscarPorVoluntario(voluntario_id: number): Promise<AcaoCrise[]> {
    return await AcaoCrise.findAll({
      where: {
        voluntarios_ids: { [Op.contains]: [voluntario_id] }
      }
    })
  }

}