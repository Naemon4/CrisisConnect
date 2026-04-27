'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { volunteerApi, acaoApi, AcaoCrise, Volunteer, VolunteerUser } from '@/lib/api'
import { skillLabel } from '@/lib/constants'
import Link from 'next/link'

interface AcaoComTitulo extends AcaoCrise {
  titulo?: string
}

function StatusBadge({ status }: { status: AcaoCrise['status'] }) {
  const map: Record<string, string> = { aberta: 'badge-gray', em_andamento: 'badge-orange', concluida: 'badge-green' }
  const labels: Record<string, string> = { aberta: 'Aberta', em_andamento: 'Em andamento', concluida: 'Concluída' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>
}

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const vUser = user as VolunteerUser | null
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [acoesAtivas, setAcoesAtivas] = useState<AcaoComTitulo[]>([])
  const [toggling, setToggling] = useState(false)
  const [saindoId, setSaindoId] = useState<number | null>(null)

  async function loadVolunteer() {
    if (!vUser?.id) return null
    const v = await volunteerApi.findOne(vUser.id).catch(() => null)
    setVolunteer(v)
    return v
  }

  async function loadAcoes(v: Volunteer | null) {
    if (!v?.id) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/acoes/volunteer/${v.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setAcoesAtivas(Array.isArray(data) ? data : [])
      }
    } catch {
      setAcoesAtivas([])
    }
  }

  useEffect(() => {
    loadVolunteer().then(loadAcoes)
  }, [vUser?.id])

  async function toggleStatus() {
    if (!volunteer) return
    setToggling(true)
    const newStatus = volunteer.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      const updated = await volunteerApi.updateStatus(volunteer.id, newStatus)
      setVolunteer(updated)
    } catch {
      alert('Erro ao atualizar status')
    } finally {
      setToggling(false)
    }
  }

  async function handleSair(e: React.MouseEvent, acaoId: number) {
    e.preventDefault()
    if (!volunteer) return
    if (!confirm('Deseja sair desta ação? Seu status voltará para disponível.')) return
    setSaindoId(acaoId)
    try {
      await acaoApi.sairDaAcao(acaoId, volunteer.id)
      setAcoesAtivas((p) => p.filter((a) => a.id !== acaoId))
      setVolunteer((v) => v ? { ...v, status: 'ATIVO' } : v)
    } catch (err: any) {
      alert('Erro ao sair da ação: ' + err.message)
    } finally {
      setSaindoId(null)
    }
  }

  const isAtivo = volunteer?.status === 'ATIVO'

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Olá, {vUser?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>Seu painel de voluntário</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Status card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '6px' }}>Meu status atual</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isAtivo ? 'var(--success)' : 'var(--text-3)', flexShrink: 0 }} className={isAtivo ? 'pulse' : ''} />
              <span style={{ fontSize: '22px', fontWeight: 800, color: isAtivo ? 'var(--success)' : 'var(--text-3)' }}>
                {isAtivo ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
            {isAtivo ? 'Você está visível para empresas e pode receber convites.' : 'Você está invisível para empresas.'}
          </p>
          <button
            onClick={toggleStatus}
            disabled={toggling}
            style={{
              padding: '12px', borderRadius: '10px',
              border: `1px solid ${isAtivo ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
              background: isAtivo ? 'rgba(239,68,68,0.1)' : 'var(--accent-dim)',
              color: isAtivo ? 'var(--danger)' : 'var(--accent)',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {toggling ? 'Atualizando...' : isAtivo ? 'Marcar como indisponível' : 'Marcar como disponível'}
          </button>
        </div>

        {/* Skills card */}
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Minhas habilidades</p>
          {volunteer?.skills && volunteer.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {volunteer.skills.map((s) => (
                <span key={s} className="badge badge-orange">{skillLabel(s)}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Nenhuma habilidade cadastrada</p>
          )}
        </div>
      </div>

      {/* Ações ativas */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>
            Minhas ações ativas
            <span style={{ marginLeft: '8px', fontSize: '13px', color: 'var(--text-3)', fontWeight: 400 }}>
              ({acoesAtivas.length})
            </span>
          </h3>
          <Link href="/volunteer/notificacoes" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>
            Ver notificações →
          </Link>
        </div>

        {acoesAtivas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>🙋</p>
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Você não está em nenhuma ação no momento</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {acoesAtivas.map((acao) => (
              <Link key={acao.id} href={`/volunteer/acoes/${acao.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{ background: 'var(--bg-3)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                        {acao.titulo || `Ação #${acao.id}`}
                      </p>
                      <StatusBadge status={acao.status} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {acao.habilidades_necessarias.slice(0, 3).map((s) => (
                        <span key={s} className="badge badge-blue" style={{ fontSize: '11px', padding: '2px 8px' }}>{skillLabel(s)}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleSair(e, acao.id)}
                    disabled={saindoId === acao.id}
                    style={{ flexShrink: 0, padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {saindoId === acao.id ? '⏳' : 'Sair'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Como funciona */}
      <div className="card" style={{ background: 'var(--accent-dim)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent)', marginBottom: '8px' }}>⚡ Como funciona</p>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
          Quando sua disponibilidade estiver <strong style={{ color: 'var(--text)' }}>ativa</strong>, a IA pode selecionar você para ações de crise.
          Você receberá uma notificação e poderá <strong style={{ color: 'var(--text)' }}>aceitar ou recusar</strong>.
          Ao aceitar, seu status muda para indisponível automaticamente.
        </p>
      </div>
    </div>
  )
}