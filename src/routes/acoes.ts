import { Router, Request, Response } from 'express'
import { AcaoCrise } from '../models/AcaoCrise'
import { WatsonxService } from '../services/WatsonxService'

const router = Router()

router.post('/:id/orchestrate', async (req: Request, res: Response) => {
  const acao = await AcaoCrise.findByPk(req.params.id)
  if (!acao) return res.status(404).json({ error: 'Ação não encontrada' })

  const watson = new WatsonxService()
  const resultado = await watson.orquestrarAcao(
    acao.habilidades_necessarias,
    acao.numero_voluntarios_necessarios
  )

  res.json({ resultado })
})

export default router