// src/controllers/VolunteerController.ts

import { Request, Response } from "express"
import volunteerService from "../services/VolunteerService"

class VolunteerController {

    // POST /volunteer
    async create(req: Request, res: Response) {
        try {
            const volunteer = await volunteerService.create(req.body)
            res.status(201).json({ message: "Voluntário criado com sucesso!", volunteer })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    // POST /volunteer/login
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const result = await volunteerService.login(email, password)
            res.status(200).json(result)
        } catch (error: any) {
            res.status(401).json({ error: error.message })
        }
    }

    // PUT /volunteer/:id/status
    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { status } = req.body
            const volunteer = await volunteerService.updateStatus(Number(id), status)
            res.status(200).json(volunteer)
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    // PUT /volunteer/:id
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params
            const volunteer = await volunteerService.update(Number(id), req.body)
            res.status(200).json(volunteer)
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    // GET /volunteer/:id
    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params
            const volunteer = await volunteerService.findOne(Number(id))
            res.status(200).json(volunteer)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    // DELETE /volunteer/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params
            const result = await volunteerService.delete(Number(id))
            res.status(200).json(result)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }
}

export default new VolunteerController()