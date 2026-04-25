import express, { Request, Response } from 'express'
import 'dotenv/config'
import { connectDB } from './database'
import watsonToolsRouter from './routes/watsonTools'
import acoesRouter from './routes/acoes'
 
const app = express()
const PORT = process.env.PORT ?? 3000
 
app.use(express.json())
 
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' })
})
 
app.use('/acoes', acoesRouter)
app.use('/', watsonToolsRouter)
 
const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  })
}
 
start()
 