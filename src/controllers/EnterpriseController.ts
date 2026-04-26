import { Request, Response } from 'express';
import enterpriseService from '../services/EnterpriseServices';

class EnterpriseController {

    async create(req: Request, res: Response) {
        try {
            const enterprise = await enterpriseService.create(req.body);
            res.status(201).json(enterprise);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }

    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await enterpriseService.delete(Number(id));
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const enterprise = await enterpriseService.findOne(Number(id));
            res.status(200).json(enterprise);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }    

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const enterprise = await enterpriseService.update(Number(id), req.body);
            res.status(200).json(enterprise);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new EnterpriseController;