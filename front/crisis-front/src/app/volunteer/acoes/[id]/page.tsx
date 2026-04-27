'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { acaoApi, AcaoCrise } from '@/lib/api'
import { skillLabel } from '@/lib/constants'
import Link from 'next/link'

interface AcaoComEmpresa extends AcaoCrise {
  empresa?: {
    id: number
    name: string
    email: string
    contactEmail: string
    contactPhone: string
  }
  titulo?: string
  descricao?: string
}

function StatusBadge({ status }: { status: AcaoCrise['status'] }) {
  const map: Record<string, string> = { aberta: 'badge-gray', em_andamento: 'badge-orange', concluida: 'badge-green' }
  const labels: Record<string, string> = { aberta: 'Aberta', em_andamento: 'Em andamento', concluida: 'Concluída' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>
}

export default function VolunteerAcaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [acao, setAcao] = useState<AcaoComEmpresa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    acaoApi.buscarPorId(Number(id))
      .then((data) => setAcao(data as AcaoComEmpresa))
      .catch(() => router.push('/volunteer/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-3)' }}>Carregando...</p>
      </div>
    )
  }

  if (!acao) return null

  return (
    <div className="fade-in" style={{ maxWidth: '700px' }}>
      {/* Back */}
      <Link href="/volunteer/dashboard" style={{ fontSize: '13px', color: 'var(--text-2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        ← Voltar ao dashboard
      </Link>

      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>
                {acao.titulo || `Ação #${acao.id}`}
              </h1>
              <StatusBadge status={acao.status} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              Criada em {new Date(acao.createdAt || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {acao.descricao && (
          <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '16px' }}>
            {acao.descricao}
          </p>
        )}

        {/* Habilidades */}
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Habilidades necessárias
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {acao.habilidades_necessarias.map((s) => (
              <span key={s} className="badge badge-blue">{skillLabel(s)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Voluntários confirmados</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Progresso</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            {acao.voluntarios_ativos}/{acao.numero_voluntarios_necessarios}
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-4)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (acao.voluntarios_ativos / acao.numero_voluntarios_necessarios) * 100)}%`,
            background: acao.status === 'concluida' ? 'var(--success)' : 'var(--accent)',
            borderRadius: '4px',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Empresa responsável */}
      {acao.empresa && (
        <div className="card" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Empresa responsável
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
              {acao.empresa.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '16px' }}>{acao.empresa.name}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>{acao.empresa.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-3)', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email de contato
              </p>
              <a
                href={`mailto:${acao.empresa.contactEmail}`}
                style={{ fontSize: '14px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
              >
                {acao.empresa.contactEmail}
              </a>
            </div>
            <div style={{ background: 'var(--bg-3)', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Telefone de contato
              </p>
              <a
                href={`tel:${acao.empresa.contactPhone}`}
                style={{ fontSize: '14px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
              >
                {acao.empresa.contactPhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}