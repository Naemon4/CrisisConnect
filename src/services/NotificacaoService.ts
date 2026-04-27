// src/services/NotificacaoService.ts

import { Notificacao } from '../models/Notificacao'
import { AcaoCrise } from "../models/AcaoCrise"
import { Volunteer } from "../models/Volunteer"

class NotificacaoService {

    async criar(voluntario_id: number, acao_id: number) {
        // evita duplicata — se já existe pendente, não cria outra
        const existe = await Notificacao.findOne({
            where: { voluntario_id, acao_id, status: 'pendente' }
        })
        if (existe) throw new Error('Voluntário já foi notificado para esta ação')

        return await Notificacao.create({ voluntario_id, acao_id })
    }

    async buscarPorVoluntario(voluntario_id: number) {
        return await Notificacao.findAll({ where: { voluntario_id }, order: [['createdAt', 'DESC']] })
    }

    async responder(id: number, status: 'aceito' | 'recusado') {
        const notificacao = await Notificacao.findByPk(id)
        if (!notificacao) throw new Error('Notificação não encontrada')
        if (notificacao.status !== 'pendente') throw new Error('Notificação já foi respondida')

        await notificacao.update({ status })

        // Se aceitou, adiciona o voluntário na ação
        if (status === 'aceito') {
            const acao = await AcaoCrise.findByPk(notificacao.acao_id)
            if (acao) {
                const ids = acao.voluntarios_ids || []
                if (!ids.includes(notificacao.voluntario_id)) {
                    await acao.update({
                        voluntarios_ids: [...ids, notificacao.voluntario_id],
                        voluntarios_ativos: acao.voluntarios_ativos + 1,
                    })
                }
            }

            // Muda status do voluntário para inativo
            await Volunteer.update(
                { status: 'INATIVO' },
                { where: { id: notificacao.voluntario_id } }
            )
        }

        return notificacao
    }

    async deletar(id: number) {
        const notificacao = await Notificacao.findByPk(id)
        if (!notificacao) throw new Error('Notificação não encontrada')
        await notificacao.destroy()
        return { message: 'Notificação deletada!' }
    }

}

export default new NotificacaoService()