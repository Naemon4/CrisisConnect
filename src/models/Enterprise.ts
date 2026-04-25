import { Model, DataTypes } from "sequelize";

export class Enterprise extends Model{
    declare id: number;
    declare name: String;
    declare email: String
    declare password: String;
    declare cnpj: String;
    declare contactEmail: String;
    declare contactPhone: String;
}

Enterprise.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
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
    cnpj: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, 
{
    sequelize,
    modelName: "Enterprise",
    tableName: "enterprises",
    timestamps: true
})