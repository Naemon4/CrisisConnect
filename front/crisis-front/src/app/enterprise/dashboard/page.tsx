'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { acaoApi, AcaoCrise } from '@/lib/api'
import { EnterpriseUser } from '@/lib/api'
import Link from 'next/link'
import { STATUS_LABELS } from '@/lib/constants'

function StatusBadge({ status }: { status: AcaoCrise['status'] }) {
  const map = {
    pendente: 'badge-gray',
    em_andamento: 'badge-orange',
    concluida: 'badge-green',
  }
  return (
    <span className={`badge ${map[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export default function EnterpriseDashboard() {
  const { user } = useAuth()
  const enterprise = user as EnterpriseUser | null
  const [acoes, setAcoes] = useState<AcaoCrise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enterprise?.id) return
    acaoApi
      .buscarPorEmpresa(enterprise.id)
      .then(setAcoes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [enterprise?.id])

  const stats = {
    total: acoes.length,
    emAndamento: acoes.filter((a) => a.status === 'em_andamento').length,
    concluidas: acoes.filter((a) => a.status === 'concluida').length,
    totalVoluntarios: acoes.reduce((acc, a) => acc + a.voluntarios_ativos, 0),
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Olá, {enterprise?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '15px' }}>
            Visão geral das suas ações de crise
          </p>
        </div>
        <Link href="/enterprise/acoes">
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
            + Nova Ação
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total de ações', value: stats.total, color: 'var(--text)' },
          { label: 'Em andamento', value: stats.emAndamento, color: 'var(--accent)' },
          { label: 'Concluídas', value: stats.concluidas, color: 'var(--success)' },
          { label: 'Voluntários ativados', value: stats.totalVoluntarios, color: 'var(--info)' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '32px', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent actions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Ações Recentes</h3>
          <Link href="/enterprise/acoes" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>Carregando...</p>
        ) : acoes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🚨</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '16px' }}>
              Nenhuma ação de crise ainda
            </p>
            <Link href="/enterprise/acoes">
              <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Criar primeira ação
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {acoes.slice(0, 5).map((acao) => (
              <div
                key={acao.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-3)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{acao.titulo}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    {acao.voluntarios_ativos}/{acao.numero_voluntarios_necessarios} voluntários •{' '}
                    {acao.habilidades_necessarias.slice(0, 2).join(', ')}
                  </p>
                </div>
                <StatusBadge status={acao.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
