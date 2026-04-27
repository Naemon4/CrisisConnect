// src/controllers/EnterpriseController.ts

import { Request, Response } from "express"
import enterpriseService from "../services/EnterpriseServices"

class EnterpriseController {

    // POST /enterprise
    async create(req: Request, res: Response) {
        try {
            const enterprise = await enterpriseService.create(req.body)
            res.status(201).json({ message: "Empresa criada com sucesso!", enterprise })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    // POST /enterprise/login
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const result = await enterpriseService.login(email, password)
            res.status(200).json(result)
        } catch (error: any) {
            res.status(401).json({ error: error.message })
        }
    }

    // GET /enterprise/:id
    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params
            const enterprise = await enterpriseService.findOne(Number(id))
            res.status(200).json(enterprise)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    // PUT /enterprise/:id
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params
            const enterprise = await enterpriseService.update(Number(id), req.body)
            res.status(200).json(enterprise)
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    // DELETE /enterprise/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params
            const result = await enterpriseService.delete(Number(id))
            res.status(200).json(result)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }
}

export default new EnterpriseController()