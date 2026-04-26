import { Request, Response } from "express";
import volunteerService from "../services/VolunteerService";

class VolunteerController {
    

    // POST /volunteers
    async create(req: Request, res: Response) {
     try {
          const volunteer = await volunteerService.create(req.body);
           res.status(201).write("Voluntário criado com sucesso!");
       } catch (error: any) {
           res.status(400).json({ error: error.message });
        }
    }


    // PUT /volunteers/:id/status
    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const volunteer = await volunteerService.updateStatus(Number(id), status);
            res.status(200).json(volunteer);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /volunteers/:id
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const volunteer = await volunteerService.update(Number(id), req.body);
            res.status(200).json(volunteer);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get /volunteers/:id
    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const volunteer = await volunteerService.findOne(Number(id));
            res.status(200).json(volunteer); 
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // delete /volunteers/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await volunteerService.delete(Number(id));
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new VolunteerController;