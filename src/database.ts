// src/database.ts

import { Sequelize } from 'sequelize'
import 'dotenv/config'

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST ?? 'localhost',
    dialect: 'postgres',
    logging: false,
  }
)

export const connectDB = async () => {
  // ordem importa: sem FK primeiro, com FK depois
  require('./models/Volunteer')
  require('./models/Enterprise')
  require('./models/AcaoCrise')
  require('./models/Notificacao') // depende de Volunteer e AcaoCrise

  await sequelize.authenticate()
  await sequelize.sync({ force: false })
  console.log('Banco de dados conectado.')
}

export default sequelize