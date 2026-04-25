import { Sequelize } from 'sequelize'
import 'dotenv/config'
 
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST ?? 'localhost',
    dialect: 'postgres',
    logging: false, // mude para console.log para ver as queries
  }
)
 
export const connectDB = async () => {
  // importa os models na ordem certa — sem FK primeiro
  require('./models/Volunteer')
  require('./models/Enterprise')
  require('./models/AcaoCrise')

  await sequelize.authenticate()
  await sequelize.sync({ force: false })
  console.log('Banco de dados conectado.')
}
 
export default sequelize