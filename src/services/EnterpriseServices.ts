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

    
}