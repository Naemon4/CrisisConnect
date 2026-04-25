import { Skills } from "../enums/Skills";
import { Status } from "../enums/Status";
import { Volunteer } from "../models/Volunteer";

class VolunteerService{

    async create(data: {
        fullname: String,
        email: String,
        password: String,
        cpf: String,
        State: String,
        city: String,
        skills: Skills[];
    }) {
         const volunteerExists = await Volunteer.findOne({ where: { email: data.email } });
    if (volunteerExists) throw new Error("Email já cadastrado");

    return await Volunteer.create(data);
    }


    async updateStatus(id: number, status: Status) {
        const volunteer = await Volunteer.findByPk(id);
        if (!volunteer) throw new Error("Voluntário não encontrado");
        await volunteer.update({ status });
        return volunteer;
    }

    async update(id: number, data: {
        fullname?: String,
        email?: String,
        password?: String,
        cpf?: String,
        State?: String,
        city?: String,
        skills?: Skills[]
    }) {
        const volunteer = await this.findOne(id);
        await volunteer.update(data);
        return volunteer;
    }

    async findOne(id: number) {
        const volunteer = await Volunteer.findByPk(id);
        if (!volunteer) throw new Error("Voluntário não encontrado");
        return volunteer;
    }

    async delete (id: number) {
        const volunteer = await Volunteer.findByPk(id);
        if (!volunteer) throw new Error("Voluntário não encontrado");
        await volunteer.destroy();
        return { message: "Voluntário deletado!" };
    }
}

export default new VolunteerService;