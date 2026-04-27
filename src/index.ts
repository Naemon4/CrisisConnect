import express, { Request, Response } from 'express'
import 'dotenv/config'
import { connectDB } from './database'
import watsonToolsRouter from './routes/watsonTools'
import acoesRouter from './routes/acoes'
import volunteerRouter from "./routes/Volunteer"
import enterpriseRouter from "./routes/EnterpriseRouter"
import notificacoesRouter from "./routes/Notificacoes"
import cors from 'cors'
 
const app = express()
const PORT = process.env.PORT ?? 3000
 
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}))

app.use(express.json())
 
app.use('/acoes', acoesRouter)
app.use('/volunteer', volunteerRouter)
app.use('/enterprise', enterpriseRouter)
app.use('/notificacao', notificacoesRouter)
app.use('/', watsonToolsRouter)
 
const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  })
}
 
start()
 