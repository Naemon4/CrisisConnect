import { Router } from 'express'
import VolunteerController from '../controllers/VolunteerController'

const router = Router()

router.post('/', VolunteerController.create)
router.put('/:id/status', VolunteerController.updateStatus)
router.get('/:id', VolunteerController.findOne)
router.delete('/:id', VolunteerController.delete)

export default router