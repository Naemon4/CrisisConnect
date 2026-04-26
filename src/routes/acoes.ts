// src/routes/acoes.ts

import { Router } from 'express'
import { AcaoCriseController } from '../controllers/AcaoCriseController'

const router = Router()
const controller = new AcaoCriseController()

router.post('/', controller.criar.bind(controller))
router.get('/:id', controller.buscarPorId.bind(controller))
router.get('/empresa/:empresa_id', controller.buscarPorEmpresa.bind(controller))
router.put('/:id', controller.atualizar.bind(controller))
router.delete('/:id', controller.deletar.bind(controller))
router.post('/:id/orchestrate', controller.orquestrar.bind(controller))
router.post('/acoes/:id/aceitar', controller.aceitarAcao.bind(controller))

export default router