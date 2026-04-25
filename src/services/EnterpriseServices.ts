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
        const enterprise = await Enterprise.findByPk(id);
        if (!enterprise) throw new Error("Empresa não encontrada");
        await enterprise.destroy();
        return { message: "Empresa deletada!" };
    }

    
}