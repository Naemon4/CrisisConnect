import axios from "axios";
 
export async function notifyEnterprise(
  webhookUrl: string,
  acaoCriseId: number,
  volunteerId: number,
  volunteerName: string
): Promise<void> {
  await axios.post(webhookUrl, {
    event: "acao_crise.aceita",
    acaoCriseId,
    volunteerId,
    volunteerName,
    acceptedAt: new Date().toISOString(),
  });
 
  console.log(`[WEBHOOK] Empresa notificada: ${webhookUrl}`);
}
 
export default notifyEnterprise;