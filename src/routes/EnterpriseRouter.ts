import { Router } from 'express'
import EnterpriseController from '../controllers/EnterpriseController'

const router = Router()

router.post('/', EnterpriseController.create)
router.get('/:id', EnterpriseController.findOne)
router.put('/:id', EnterpriseController.update)
router.delete('/:id', EnterpriseController.delete)  

export default router