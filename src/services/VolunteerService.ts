// src/services/VolunteerService.ts

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Skills } from "../enums/Skills"
import { Status } from "../enums/Status"
import { Volunteer } from "../models/Volunteer"
import { Enterprise } from '../models/Enterprise'

class VolunteerService {

    async create(data: {
        fullName: string
        email: string
        password: string
        cpf: string
        state: string
        city: string
        skills: Skills[]
    }) {
        const emailExists = await Volunteer.findOne({ where: { email: data.email } })
        if (emailExists) throw new Error("Email já cadastrado")

        const cpfExists = await Volunteer.findOne({ where: { cpf: data.cpf } })
        if (cpfExists) throw new Error("CPF já cadastrado")

        const hashedPassword = await bcrypt.hash(data.password, 10)

        return await Volunteer.create({
            ...data,
            password: hashedPassword,
            status: Status.Inativo
        })
    }

    async login(email: string, password: string) {
        const volunteer = await Volunteer.findOne({ where: { email } })
        if (!volunteer) throw new Error("Email ou senha inválidos")

        const isEnterprise = await Enterprise.findOne({ where: { email } })
        if (isEnterprise) throw new Error('Email ou senha inválidos')

        const senhaValida = await bcrypt.compare(password, volunteer.password as string)
        if (!senhaValida) throw new Error("Email ou senha inválidos")

        const token = jwt.sign(
            { id: volunteer.id, type: 'volunteer' },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        )

        return {
            token,
            user: {
                id: volunteer.id,
                fullName: volunteer.fullName,
                email: volunteer.email,
                status: volunteer.status,
                skills: volunteer.skills
            }
        }
    }

    async updateStatus(id: number, status: Status) {
        const volunteer = await this.findOne(id)
        await volunteer.update({ status })
        return volunteer
    }

    async update(id: number, data: {
        fullName?: string
        email?: string
        password?: string
        cpf?: string
        state?: string
        city?: string
        skills?: Skills[]
    }) {
        const volunteer = await this.findOne(id)

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10)
        }

        await volunteer.update(data)
        return volunteer
    }

    async findOne(id: number) {
        const volunteer = await Volunteer.findByPk(id)
        if (!volunteer) throw new Error("Voluntário não encontrado")
        return volunteer
    }

    async delete(id: number) {
        const volunteer = await this.findOne(id)
        await volunteer.destroy()
        return { message: "Voluntário deletado!" }
    }
}

export default new VolunteerService()