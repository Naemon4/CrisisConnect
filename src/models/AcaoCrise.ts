// src/models/AcaoCrise.ts

import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../database'
import { Enterprise } from './Enterprise'

export interface AcaoCriseAttributes {
  id: number
  empresa_id: number
  numero_voluntarios_necessarios: number
  voluntarios_ativos: number
  habilidades_necessarias: string[]
  status: 'aberta' | 'em_andamento' | 'concluida'
  voluntarios_ids: number[]
  titulo: string
  descricao: string
  createdAt?: Date
  updatedAt?: Date
}

interface AcaoCriseCreationAttributes
  extends Optional<AcaoCriseAttributes, 'id' | 'voluntarios_ativos' | 'status'> { }

export class AcaoCrise
  extends Model<AcaoCriseAttributes, AcaoCriseCreationAttributes>
  implements AcaoCriseAttributes {
  declare id: number
  declare empresa_id: number
  declare numero_voluntarios_necessarios: number
  declare voluntarios_ativos: number
  declare habilidades_necessarias: string[]
  declare status: 'aberta' | 'em_andamento' | 'concluida'
  declare voluntarios_ids: number[]
  declare titulo: string
  declare descricao: string
  declare createdAt: Date
  declare updatedAt: Date
}

AcaoCrise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'enterprises',
        key: 'id',
      },
    },
    numero_voluntarios_necessarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    voluntarios_ativos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    habilidades_necessarias: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('aberta', 'em_andamento', 'concluida'),
      allowNull: false,
      defaultValue: 'aberta',
    },
    voluntarios_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: [],
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'acoes_crise',
    timestamps: true,
  }
)

AcaoCrise.belongsTo(Enterprise, { foreignKey: 'empresa_id', as: 'empresa' })

export default AcaoCrise