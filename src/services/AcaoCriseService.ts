// src/services/AcaoCriseService.ts

import { AcaoCrise, AcaoCriseAttributes } from '../models/AcaoCrise'
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
}