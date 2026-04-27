'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { acaoApi, volunteerApi, notificacaoApi, AcaoCrise, Volunteer } from '@/lib/api'
import { skillLabel, SKILLS_OPTIONS } from '@/lib/constants'
import Link from 'next/link'

interface VoluntarioSugerido {
  id: number
  fullName: string
  email: string
  city: string
  state: string
  skills: string[]
}

function parseVoluntariosFromIA(resultado: any): VoluntarioSugerido[] {
  try {
    const stepHistory = resultado?.result?.data?.message?.step_history || []
    for (const step of stepHistory) {
      for (const detail of step.step_details || []) {
        if (detail.type === 'tool_response' && detail.content) {
          const parsed = JSON.parse(detail.content)
          if (parsed.voluntarios && Array.isArray(parsed.voluntarios)) {
            return parsed.voluntarios.map((v: any) => ({
              id: v.id,
              fullName: v.fullName,
              email: v.email,
              city: v.city,
              state: v.state,
              skills: v.skills || [],
            }))
          }
        }
      }
    }
    return []
  } catch {
    return []
  }
}

function StatusBadge({ status }: { status: AcaoCrise['status'] }) {
  const map: Record<string, string> = { aberta: 'badge-gray', em_andamento: 'badge-orange', concluida: 'badge-green' }
  const labels: Record<string, string> = { aberta: 'Aberta', em_andamento: 'Em andamento', concluida: 'Concluída' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>
}

function EditModal({ acao, onClose, onSave }: { acao: AcaoCrise; onClose: () => void; onSave: () => void }) {
  const [titulo, setTitulo] = useState(acao.titulo || '')
  const [descricao, setDescricao] = useState(acao.descricao || '')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(acao.habilidades_necessarias)
  const [qtd, setQtd] = useState(acao.numero_voluntarios_necessarios)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(v: string) {
    setSelectedSkills((p) => p.includes(v) ? p.filter((s) => s !== v) : [...p, v])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedSkills.length === 0) { setError('Selecione pelo menos uma habilidade'); return }
    setLoading(true); setError('')
    try {
      await acaoApi.atualizar(acao.id, {
        titulo,
        descricao,
        habilidades_necessarias: selectedSkills,
        numero_voluntarios_necessarios: qtd,
      })
      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Editar Ação</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Título</label>
            <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Descrição</label>
            <textarea className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} style={{ resize: 'vertical' }} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
              Habilidades <span style={{ color: 'var(--text-3)' }}>({selectedSkills.length} selecionadas)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SKILLS_OPTIONS.map((s) => (
                <button key={s.value} type="button" onClick={() => toggle(s.value)}
                  className={`skill-chip ${selectedSkills.includes(s.value) ? 'selected' : ''}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Quantidade de voluntários</label>
            <input className="input" type="number" min={1} max={100} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} style={{ width: '120px' }} />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: 'var(--danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

function VoluntarioAtivoCard({ volunteer }: { volunteer: Volunteer }) {
  return (
    <div style={{ background: 'var(--bg-3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--border)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--success)', flexShrink: 0 }}>
        {volunteer.fullName.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{volunteer.fullName}</p>
          <span className="badge badge-green" style={{ fontSize: '11px' }}>✓ Ativo</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px' }}>
          {volunteer.email} · {volunteer.city}, {volunteer.state}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {volunteer.skills.slice(0, 4).map((s) => (
            <span key={s} className="badge badge-blue" style={{ fontSize: '11px', padding: '2px 8px' }}>{skillLabel(s)}</span>
          ))}
          {volunteer.skills.length > 4 && (
            <span className="badge badge-gray" style={{ fontSize: '11px', padding: '2px 8px' }}>+{volunteer.skills.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function VoluntarioSugeridoCard({ voluntario, onNotificar, loadingNotif, jaNotificado }: {
  voluntario: VoluntarioSugerido
  onNotificar: (id: number) => void
  loadingNotif: number | null
  jaNotificado: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--border)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
        {voluntario.fullName.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{voluntario.fullName}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px' }}>
          {voluntario.email} · {voluntario.city}, {voluntario.state}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {voluntario.skills.slice(0, 4).map((s) => (
            <span key={s} className="badge badge-blue" style={{ fontSize: '11px', padding: '2px 8px' }}>{skillLabel(s)}</span>
          ))}
          {voluntario.skills.length > 4 && (
            <span className="badge badge-gray" style={{ fontSize: '11px', padding: '2px 8px' }}>+{voluntario.skills.length - 4}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onNotificar(voluntario.id)}
        disabled={jaNotificado || loadingNotif === voluntario.id}
        style={{
          flexShrink: 0, padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: jaNotificado ? 'rgba(34,197,94,0.15)' : 'var(--accent)',
          color: jaNotificado ? 'var(--success)' : '#fff',
          fontWeight: 600, fontSize: '13px',
          cursor: jaNotificado ? 'default' : 'pointer',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        {loadingNotif === voluntario.id ? '⏳' : jaNotificado ? '✓ Notificado' : '🔔 Notificar'}
      </button>
    </div>
  )
}

export default function AcaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const acaoId = Number(id)

  const [acao, setAcao] = useState<AcaoCrise | null>(null)
  const [voluntariosAtivos, setVoluntariosAtivos] = useState<Volunteer[]>([])
  const [voluntariosSugeridos, setVoluntariosSugeridos] = useState<VoluntarioSugerido[]>([])
  const [notificados, setNotificados] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [orchestrating, setOrchestrating] = useState(false)
  const [loadingNotif, setLoadingNotif] = useState<number | null>(null)
  const [showEdit, setShowEdit] = useState(false)

  const loadAcao = useCallback(async () => {
    setLoading(true)
    try {
      const data = await acaoApi.buscarPorId(acaoId)
      setAcao(data)

      if ((data as any).voluntarios_ids && (data as any).voluntarios_ids.length > 0) {
        const volunteers = await Promise.all(
          (data as any).voluntarios_ids.map((vid: number) => volunteerApi.findOne(vid).catch(() => null))
        )
        setVoluntariosAtivos(volunteers.filter(Boolean) as Volunteer[])
      }
    } catch {
      router.push('/enterprise/acoes')
    } finally {
      setLoading(false)
    }
  }, [acaoId, router])

  useEffect(() => { loadAcao() }, [loadAcao])

  async function handleOrchestrate() {
    setOrchestrating(true)
    try {
      const res = await acaoApi.orquestrar(acaoId)
      const voluntarios = parseVoluntariosFromIA(res.resultado)
      if (voluntarios.length > 0) {
        setVoluntariosSugeridos(voluntarios)
        setNotificados([])
      } else {
        alert('A IA não encontrou voluntários adequados.')
      }
      await loadAcao()
    } catch (err: any) {
      alert('Erro ao orquestrar: ' + err.message)
    } finally {
      setOrchestrating(false)
    }
  }

  async function handleNotificar(voluntarioId: number) {
    setLoadingNotif(voluntarioId)
    try {
      await notificacaoApi.criar(voluntarioId, acaoId)
      setNotificados((p) => [...p, voluntarioId])
    } catch (err: any) {
      alert('Erro ao notificar: ' + err.message)
    } finally {
      setLoadingNotif(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Deseja deletar esta ação?')) return
    await acaoApi.deletar(acaoId).catch(() => null)
    router.push('/enterprise/acoes')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-3)' }}>Carregando...</p>
      </div>
    )
  }

  if (!acao) return null

  const progresso = Math.min(100, (acao.voluntarios_ativos / acao.numero_voluntarios_necessarios) * 100)

  return (
    <div className="fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/enterprise/acoes" style={{ fontSize: '13px', color: 'var(--text-2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          ← Voltar para ações
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700 }}>{acao.titulo || `Ação #${acao.id}`}</h1>
              <StatusBadge status={acao.status} />
            </div>
            {acao.descricao && (
              <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '6px', lineHeight: 1.5 }}>
                {acao.descricao}
              </p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              Criada em {new Date(acao.createdAt || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, marginLeft: '16px' }}>
            <button
              onClick={() => setShowEdit(true)}
              className="btn-ghost"
              style={{ padding: '10px 20px' }}
            >
              ✏️ Editar
            </button>
            <button className="btn-danger" onClick={handleDelete} style={{ padding: '10px 20px' }}>
              Deletar
            </button>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Voluntários confirmados</p>
          <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent)', marginBottom: '12px' }}>
            {acao.voluntarios_ativos}<span style={{ fontSize: '18px', color: 'var(--text-3)' }}>/{acao.numero_voluntarios_necessarios}</span>
          </p>
          <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progresso}%`, background: acao.status === 'concluida' ? 'var(--success)' : 'var(--accent)', borderRadius: '4px', transition: 'width 0.5s' }} />
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px' }}>Habilidades necessárias</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {acao.habilidades_necessarias.map((s) => (
              <span key={s} className="badge badge-blue">{skillLabel(s)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Voluntários ativos */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>
            Voluntários na ação
            <span style={{ marginLeft: '8px', fontSize: '13px', color: 'var(--text-3)', fontWeight: 400 }}>
              ({voluntariosAtivos.length})
            </span>
          </h3>
        </div>

        {voluntariosAtivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>👥</p>
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Nenhum voluntário confirmado ainda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {voluntariosAtivos.map((v) => (
              <VoluntarioAtivoCard key={v.id} volunteer={v} />
            ))}
          </div>
        )}
      </div>

      {/* Orquestração IA */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Buscar voluntários com IA</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>
              A IA encontra os voluntários mais adequados para esta ação
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
            onClick={handleOrchestrate}
            disabled={orchestrating || acao.status === 'concluida'}
          >
            {orchestrating ? '⏳ Buscando...' : voluntariosSugeridos.length > 0 ? '🔄 Buscar outros' : '⚡ Orquestrar com IA'}
          </button>
        </div>

        {voluntariosSugeridos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 500, marginBottom: '4px' }}>
              ⚡ {voluntariosSugeridos.length} voluntário{voluntariosSugeridos.length > 1 ? 's' : ''} sugerido{voluntariosSugeridos.length > 1 ? 's' : ''}
            </p>
            {voluntariosSugeridos.map((v) => (
              <VoluntarioSugeridoCard
                key={v.id}
                voluntario={v}
                onNotificar={handleNotificar}
                loadingNotif={loadingNotif}
                jaNotificado={notificados.includes(v.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', background: 'var(--bg-3)', borderRadius: '12px' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</p>
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>
              Clique em "Orquestrar com IA" para encontrar voluntários
            </p>
          </div>
        )}
      </div>

      {showEdit && acao && (
        <EditModal acao={acao} onClose={() => setShowEdit(false)} onSave={loadAcao} />
      )}
    </div>
  )
}