// src/models/Notificacao.ts

import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../database'

export interface NotificacaoAttributes {
  id: number
  voluntario_id: number
  acao_id: number
  status: 'pendente' | 'aceito' | 'recusado'
  createdAt?: Date
  updatedAt?: Date
}

interface NotificacaoCreationAttributes
  extends Optional<NotificacaoAttributes, 'id' | 'status'> {}

export class Notificacao
  extends Model<NotificacaoAttributes, NotificacaoCreationAttributes>
  implements NotificacaoAttributes
{
  declare id: number
  declare voluntario_id: number
  declare acao_id: number
  declare status: 'pendente' | 'aceito' | 'recusado'
  declare createdAt: Date
  declare updatedAt: Date
}

Notificacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    voluntario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'volunteers', key: 'id' },
    },
    acao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'acoes_crise', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pendente', 'aceito', 'recusado'),
      allowNull: false,
      defaultValue: 'pendente',
    },
  },
  {
    sequelize,
    tableName: 'notificacoes',
    timestamps: true,
  }
)

export default Notificacao