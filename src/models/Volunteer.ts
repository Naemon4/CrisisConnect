import sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";
import { Status } from "../enums/Status";
import { Skills } from "../enums/Skills";

export class Volunteer extends Model{
    declare id: number;
    declare fullName: String;
    declare email: String;
    declare password: String;
    declare cpf: String;
    declare state : String;
    declare city : String;
    declare skills : Skills;
    declare status: Status;
}

Volunteer.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.ENUM(...Object.values(Skills))),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM(...Object.values(Status)),
    defaultValue: Status.Inativo
  }
}, 
{
    sequelize,
    modelName: "Volunteer",
    tableName: "volunteers",
    timestamps: true
});

export default Volunteer;