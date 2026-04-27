import { Router } from 'express'
import EnterpriseController from '../controllers/EnterpriseController'
import { authMiddleware, requireEnterprise } from '../middlewares/auth'

const router = Router()

// rotas públicas
router.post('/', EnterpriseController.create)
router.post('/login', EnterpriseController.login)

// rotas protegidas
router.get('/:id', authMiddleware, requireEnterprise, EnterpriseController.findOne)
router.put('/:id', authMiddleware, requireEnterprise, EnterpriseController.update)
router.delete('/:id', authMiddleware, requireEnterprise, EnterpriseController.delete)

export default router