'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { notificacaoApi, acaoApi, Notificacao, AcaoCrise, VolunteerUser } from '@/lib/api'

export default function NotificacoesPage() {
  const { user } = useAuth()
  const vUser = user as VolunteerUser | null
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [acoes, setAcoes] = useState<Record<number, AcaoCrise>>({})
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    if (!vUser?.id) return
    setLoading(true)
    const data = await notificacaoApi.buscarPorVoluntario(vUser.id).catch(() => [])
    setNotificacoes(data)

    // busca os detalhes de cada ação para mostrar título e descrição
    const acoesMap: Record<number, AcaoCrise> = {}
    await Promise.all(
      data.map(async (n) => {
        try {
          const acao = await acaoApi.buscarPorId(n.acao_id)
          acoesMap[n.acao_id] = acao
        } catch { }
      })
    )
    setAcoes(acoesMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [vUser?.id])

  async function handleResponder(id: number, status: 'aceito' | 'recusado') {
    setLoadingId(id)
    try {
      await notificacaoApi.responder(id, status)
      setNotificacoes((p) => p.map((n) => n.id === id ? { ...n, status } : n))
    } catch (err: any) {
      alert('Erro: ' + err.message)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDeletar(id: number) {
    setDeletingId(id)
    try {
      await notificacaoApi.deletar(id)
      setNotificacoes((p) => p.filter((n) => n.id !== id))
    } catch (err: any) {
      alert('Erro: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const pendentes = notificacoes.filter((n) => n.status === 'pendente')
  const respondidas = notificacoes.filter((n) => n.status !== 'pendente')

  if (loading) return <p style={{ color: 'var(--text-3)' }}>Carregando...</p>

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Notificações</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>
          Convites de empresas que precisam das suas habilidades
        </p>
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>Aguardando resposta</p>
            <span className="badge badge-orange">{pendentes.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendentes.map((n) => {
              const acao = acoes[n.acao_id]
              return (
                <div key={n.id} className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                        {acao?.titulo || `Ação #${n.acao_id}`}
                      </p>
                      {acao?.descricao && (
                        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '4px', lineHeight: 1.5 }}>
                          {acao.descricao}
                        </p>
                      )}
                      <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                        {new Date(n.createdAt || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-orange">🔔 Novo convite</span>
                      <button
                        onClick={() => handleDeletar(n.id)}
                        disabled={deletingId === n.id}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                        title="Deletar notificação"
                      >
                        {deletingId === n.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>

                  {acao?.habilidades_necessarias && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {acao.habilidades_necessarias.map((s) => (
                        <span key={s} className="badge badge-blue" style={{ fontSize: '11px' }}>
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px' }}>
                    Uma empresa precisa da sua ajuda nesta ação de crise. Deseja participar?
                  </p>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, padding: '12px' }}
                      onClick={() => handleResponder(n.id, 'aceito')}
                      disabled={loadingId === n.id}
                    >
                      {loadingId === n.id ? 'Processando...' : '✓ Aceitar missão'}
                    </button>
                    <button
                      className="btn-danger"
                      style={{ flex: 1, padding: '12px' }}
                      onClick={() => handleResponder(n.id, 'recusado')}
                      disabled={loadingId === n.id}
                    >
                      ✕ Recusar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      {respondidas.length > 0 && (
        <div>
          <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px', color: 'var(--text-2)' }}>
            Histórico
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {respondidas.map((n) => {
              const acao = acoes[n.acao_id]
              return (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-3)', borderRadius: '12px', border: '1px solid var(--border)', opacity: 0.8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>
                      {acao?.titulo || `Ação #${n.acao_id}`}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                      {new Date(n.createdAt || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${n.status === 'aceito' ? 'badge-green' : 'badge-red'}`}>
                      {n.status === 'aceito' ? '✓ Aceito' : '✕ Recusado'}
                    </span>
                    <button
                      onClick={() => handleDeletar(n.id)}
                      disabled={deletingId === n.id}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                    >
                      {deletingId === n.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {notificacoes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔔</p>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '8px' }}>Nenhuma notificação ainda</p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>
            Quando sua disponibilidade estiver ativa, você receberá convites aqui
          </p>
        </div>
      )}
    </div>
  )
}