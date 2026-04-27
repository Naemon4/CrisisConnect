export const SKILLS_OPTIONS = [
  { value: 'PRIMEIROS_SOCORROS', label: 'Primeiros Socorros' },
  { value: 'COMUNICACAO', label: 'Comunicação' },
  { value: 'TRABALHO_EM_EQUIPE', label: 'Trabalho em Equipe' },
  { value: 'ORGANIZACAO_DE_EVENTOS', label: 'Organização de Eventos' },
  { value: 'CULINARIA', label: 'Culinária' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'SAUDE_MENTAL', label: 'Saúde Mental' },
  { value: 'CONSTRUCAO_CIVIL', label: 'Construção Civil' },
  { value: 'INFORMATICA', label: 'Informática' },
  { value: 'IDIOMAS', label: 'Idiomas' },
  { value: 'FOTOGRAFIA', label: 'Fotografia' },
  { value: 'DESIGN_GRAFICO', label: 'Design Gráfico' },
  { value: 'MIDIAS_SOCIAIS', label: 'Mídias Sociais' },
  { value: 'CAPTACAO_DE_RECURSOS', label: 'Captação de Recursos' },
  { value: 'JARDINAGEM', label: 'Jardinagem' },
  { value: 'CUIDADO_COM_ANIMAIS', label: 'Cuidado com Animais' },
  { value: 'ARTESANATO', label: 'Artesanato' },
  { value: 'LIDERANCA', label: 'Liderança' },
  { value: 'ENFERMAGEM', label: 'Enfermagem' },
]

export const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

export function skillLabel(value: string): string {
  return SKILLS_OPTIONS.find(s => s.value === value)?.label ?? value
}

export const STATUS_LABELS = {
  ativo: 'Disponível',
  inativo: 'Indisponível',
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
}
