import { Enterprise } from "../models/Enterprise";

class EnterpriseService {

    async create(data: {
    name: String,
    email: String,
    password: String,
    cnpj: String,
    contactEmail: String,
    contactPhone: String
    }) {
    const enterpriseExists = await Enterprise.findOne({ where: { cnpj: data.cnpj } });
    if (enterpriseExists) throw new Error("CNPJ já cadastrado");
    }

    async delete(id: number) {
        const deleted = await this.findOne(id);
        await deleted.destroy();
        return { message: "Empresa deletada!" };
    }

    async findOne(id: number) {
        const enterprise = await Enterprise.findByPk(id);
        if (!enterprise) throw new Error("Empresa não encontrada");
        return enterprise;
    }

    async update(id: number, data: {
        name?: String,
        email?: String,
        password?: String,
        cnpj?: String,
        contactEmail?: String,
        contactPhone?: String
    }) {
        const enterprise = await this.findOne(id);
        await enterprise.update(data);
        return enterprise;
    }
    
}

export default new EnterpriseService;