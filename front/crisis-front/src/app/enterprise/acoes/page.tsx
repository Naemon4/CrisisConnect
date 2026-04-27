'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/lib/auth'
import { acaoApi, AcaoCrise, EnterpriseUser } from '@/lib/api'
import { SKILLS_OPTIONS, skillLabel } from '@/lib/constants'
import Link from 'next/link'

function StatusBadge({ status }: { status: AcaoCrise['status'] }) {
  const map: Record<string, string> = { aberta: 'badge-gray', em_andamento: 'badge-orange', concluida: 'badge-green' }
  const labels: Record<string, string> = { aberta: 'Aberta', em_andamento: 'Em andamento', concluida: 'Concluída' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>
}

function Modal({ onClose, onSave, empresa_id }: { onClose: () => void; onSave: () => void; empresa_id: number }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [qtd, setQtd] = useState(1)
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
      await acaoApi.criar({ empresa_id, titulo, descricao, habilidades_necessarias: selectedSkills, numero_voluntarios_necessarios: qtd })
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
          <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Nova Ação de Crise</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Título da ação</label>
            <input
              className="input"
              placeholder="Ex: Inundação no Rio Grande do Sul"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Descrição</label>
            <textarea
              className="input"
              placeholder="Descreva a situação e o que precisa ser feito..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
              Habilidades necessárias <span style={{ color: 'var(--text-3)' }}>({selectedSkills.length} selecionadas)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SKILLS_OPTIONS.map((s) => (
                <button key={s.value} type="button" onClick={() => toggle(s.value)} className={`skill-chip ${selectedSkills.includes(s.value) ? 'selected' : ''}`}>
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
              {loading ? 'Criando...' : 'Criar ação'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function AcoesPage() {
  const { user } = useAuth()
  const enterprise = user as EnterpriseUser | null
  const [acoes, setAcoes] = useState<AcaoCrise[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function load() {
    if (!enterprise?.id) return
    setLoading(true)
    const data = await acaoApi.buscarPorEmpresa(enterprise.id).catch(() => [])
    setAcoes(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [enterprise?.id])

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.preventDefault()
    if (!confirm('Deseja deletar esta ação?')) return
    await acaoApi.deletar(id).catch(() => null)
    setAcoes((p) => p.filter((a) => a.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Ações de Crise</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Clique em uma ação para gerenciá-la</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => setShowModal(true)}>
          + Nova Ação
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-3)' }}>Carregando...</p>
      ) : acoes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🚨</p>
          <p style={{ color: 'var(--text-2)', marginBottom: '20px' }}>Nenhuma ação de crise cadastrada</p>
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => setShowModal(true)}>
            Criar primeira ação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {acoes.map((acao) => (
            <Link key={acao.id} href={`/enterprise/acoes/${acao.id}`} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ cursor: 'pointer', transition: 'border-color 0.2s', borderColor: 'var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
                        {(acao as any).titulo || `Ação #${acao.id}`}
                      </h3>
                      <StatusBadge status={acao.status} />
                    </div>
                    {(acao as any).descricao && (
                      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '4px', lineHeight: 1.4 }}>
                        {(acao as any).descricao}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      {new Date(acao.createdAt || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
                      👥 {acao.voluntarios_ativos}/{acao.numero_voluntarios_necessarios}
                    </span>
                    <button
                      className="btn-danger"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={(e) => handleDelete(e, acao.id)}
                    >
                      Deletar
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {acao.habilidades_necessarias.map((s) => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: '11px' }}>{skillLabel(s)}</span>
                  ))}
                </div>

                <div style={{ height: '3px', background: 'var(--bg-4)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (acao.voluntarios_ativos / acao.numero_voluntarios_necessarios) * 100)}%`,
                    background: acao.status === 'concluida' ? 'var(--success)' : 'var(--accent)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && enterprise && (
        <Modal onClose={() => setShowModal(false)} onSave={load} empresa_id={enterprise.id} />
      )}
    </div>
  )
}