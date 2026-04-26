// src/services/WatsonxService.ts

import axios from 'axios'
import qs from 'qs'
import 'dotenv/config'

export class WatsonxService {
  private token: string | null = null
  private tokenExp = 0

  private async getToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    if (this.token && now < this.tokenExp - 30) {
      console.log('[Watson] Usando token em cache')
      return this.token
    }

    console.log('[Watson] Buscando novo token IAM...')
    console.log('[Watson] API Key definida:', process.env.WATSON_API_KEY ? 'sim' : 'NÃO DEFINIDA')

    if (!process.env.WATSON_API_KEY) {
      throw new Error('[Watson] WATSON_API_KEY não definida no .env')
    }

    try {
      const payload = qs.stringify({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: process.env.WATSON_API_KEY,
      })

      const resp = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        payload,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )

      this.token = resp.data.access_token as string
      this.tokenExp = resp.data.expiration
      console.log('[Watson] Token IAM obtido com sucesso')
      return this.token

    } catch (error: any) {
      console.error('[Watson] Erro ao buscar token IAM:', error.message)
      console.error('[Watson] Status:', error.response?.status)
      console.error('[Watson] Resposta:', error.response?.data)
      throw new Error(`Falha ao obter token IAM: ${error.message}`)
    }
  }

  private async buscarResultado(token: string, runId: string): Promise<any> {
    const baseUrl = `${process.env.WATSON_URL}/instances/${process.env.WATSON_PROJECT_ID}/v1/orchestrate/runs/${runId}`

    const maxTentativas = 10
    const intervalo = 3000 // 3 segundos entre cada tentativa

    for (let i = 0; i < maxTentativas; i++) {
      console.log(`[Watson] Verificando resultado (tentativa ${i + 1}/${maxTentativas})...`)

      const resp = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const status = resp.data.status
      console.log('[Watson] Status do run:', status)

      if (status === 'completed' || status === 'failed') {
        console.log('[Watson] Resultado final:', JSON.stringify(resp.data))
        return resp.data
      }

      // aguarda antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, intervalo))
    }

    throw new Error('[Watson] Timeout: o agente demorou demais para responder')
  }

  async orquestrarAcao(habilidades: string[], quantidade: number): Promise<any> {
    console.log('[Watson] Iniciando orquestração...')
    console.log('[Watson] Habilidades:', habilidades)
    console.log('[Watson] Quantidade:', quantidade)
    console.log('[Watson] WATSON_URL definida:', process.env.WATSON_URL ? 'sim' : 'NÃO DEFINIDA')

    if (!process.env.WATSON_URL) {
      throw new Error('[Watson] WATSON_URL não definida no .env')
    }

    try {
      const token = await this.getToken()

      const url = `${process.env.WATSON_URL}/instances/${process.env.WATSON_PROJECT_ID}/v1/orchestrate/runs`

      const body = {
        message: {
          role: 'user',
          content: [
            {
              response_type: 'text',
              text: `Preciso de ${quantidade} voluntários com habilidades: ${habilidades.join(', ')}.`
            }
          ]
        },
        agent_id: process.env.WATSON_AGENT_ID
      }
      console.log('[Watson] Body da requisição:', JSON.stringify(body))

      const resp = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('[Watson] Run criado com status:', resp.status)
      console.log('[Watson] Run ID:', resp.data.run_id)

      // busca o resultado do run
      const resultado = await this.buscarResultado(token, resp.data.run_id)
      return resultado

    } catch (error: any) {
      console.error('[Watson] Erro na orquestração:', error.message)
      console.error('[Watson] URL tentada:', error.config?.url)
      console.error('[Watson] Status HTTP:', error.response?.status)
      console.error('[Watson] Resposta do servidor:', JSON.stringify(error.response?.data))

      if (error.code === 'ENOTFOUND') {
        throw new Error(`[Watson] Host não encontrado. Verifique se a URL está correta: ${error.config?.url}`)
      }
      if (error.response?.status === 401) {
        throw new Error('[Watson] Token inválido ou expirado. Verifique a WATSON_API_KEY.')
      }
      if (error.response?.status === 404) {
        throw new Error('[Watson] Endpoint não encontrado. Verifique a WATSON_URL.')
      }

      throw error
    }
  }
}