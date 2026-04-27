// src/routes/notificacoes.ts

import { Router } from 'express'
import NotificacaoController from '../controllers/NotificacaoController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

router.post('/', authMiddleware, NotificacaoController.criar)
router.get('/volunteer/:id', authMiddleware, NotificacaoController.buscarPorVoluntario)
router.put('/:id/responder', authMiddleware, NotificacaoController.responder)
router.delete('/:id', authMiddleware, NotificacaoController.deletar)

export default router