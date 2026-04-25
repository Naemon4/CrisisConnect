// src/services/WatsonxService.ts

import axios from 'axios'
import qs from 'qs'
import 'dotenv/config'

export class WatsonxService {
  private token: string | null = null
  private tokenExp = 0

  private async getToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    if (this.token && now < this.tokenExp - 30) return this.token

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
    return this.token
  }

  async orquestrarAcao(habilidades: string[], quantidade: number): Promise<any> {
    const token = await this.getToken()

    const resp = await axios.post(
      `https://api.us-south.watson-orchestrate.cloud.ibm.com/v1/projects/${process.env.WATSON_PROJECT_ID}/run`,
      {
        input: `
          Preciso de ${quantidade} voluntários com as seguintes habilidades: ${habilidades.join(', ')}.
          Busque os voluntários disponíveis, selecione os mais adequados e notifique-os.
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return resp.data
  }
}