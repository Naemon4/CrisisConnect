// src/services/EnterpriseService.ts

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Enterprise } from "../models/Enterprise"
import { Volunteer } from '../models/Volunteer'

class EnterpriseService {

    async create(data: {
        name: string
        email: string
        password: string
        cnpj: string
        contactEmail: string
        contactPhone: string
    }) {
        const cnpjExists = await Enterprise.findOne({ where: { cnpj: data.cnpj } })
        if (cnpjExists) throw new Error("CNPJ já cadastrado")

        const emailExists = await Enterprise.findOne({ where: { email: data.email } })
        if (emailExists) throw new Error("Email já cadastrado")

        const hashedPassword = await bcrypt.hash(data.password, 10)

        return await Enterprise.create({
            ...data,
            password: hashedPassword
        })
    }

    async login(email: string, password: string) {
        const enterprise = await Enterprise.findOne({ where: { email } })
        if (!enterprise) throw new Error("Email ou senha inválidos")

        const isVolunteer = await Volunteer.findOne({ where: { email } })
        if (isVolunteer) throw new Error('Email ou senha inválidos')

        const senhaValida = await bcrypt.compare(password, enterprise.password as string)
        if (!senhaValida) throw new Error("Email ou senha inválidos")

        const token = jwt.sign(
            { id: enterprise.id, type: 'enterprise' },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        )

        return {
            token,
            user: {
                id: enterprise.id,
                name: enterprise.name,
                email: enterprise.email,
                contactEmail: enterprise.contactEmail,
                contactPhone: enterprise.contactPhone
            }
        }
    }

    async findOne(id: number) {
        const enterprise = await Enterprise.findByPk(id)
        if (!enterprise) throw new Error("Empresa não encontrada")
        return enterprise
    }

    async update(id: number, data: {
        name?: string
        email?: string
        password?: string
        cnpj?: string
        contactEmail?: string
        contactPhone?: string
    }) {
        const enterprise = await this.findOne(id)

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10)
        }

        await enterprise.update(data)
        return enterprise
    }

    async delete(id: number) {
        const enterprise = await this.findOne(id)
        await enterprise.destroy()
        return { message: "Empresa deletada!" }
    }
}

export default new EnterpriseService()