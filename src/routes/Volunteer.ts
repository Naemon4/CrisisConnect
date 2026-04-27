import { Router } from 'express'
import VolunteerController from '../controllers/VolunteerController'
import { authMiddleware, requireVolunteer } from '../middlewares/auth'

const router = Router()

// rotas públicas
router.post('/', VolunteerController.create)
router.post('/login', VolunteerController.login)

// rotas protegidas
router.get('/:id', authMiddleware, requireVolunteer, VolunteerController.findOne)
router.put('/:id/status', authMiddleware, requireVolunteer, VolunteerController.updateStatus)
router.put('/:id', authMiddleware, requireVolunteer, VolunteerController.update)
router.delete('/:id', authMiddleware, requireVolunteer, VolunteerController.delete)

export default router