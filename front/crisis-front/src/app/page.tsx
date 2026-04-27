'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ textAlign: 'center', maxWidth: '640px', zIndex: 1 }}>
        {/* Logo */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'var(--accent)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            ⚡
          </div>
          <span
            style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}
          >
            CrisisLink
          </span>
        </div>

        <h1
          style={{
            fontSize: '52px',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--text)',
            marginBottom: '20px',
          }}
        >
          Voluntários prontos
          <br />
          <span style={{ color: 'var(--accent)' }}>quando mais importa.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-2)',
            lineHeight: 1.7,
            marginBottom: '48px',
          }}
        >
          Conectamos empresas em situação de crise com os voluntários certos,
          no momento certo — com inteligência artificial e matching automático.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/auth/login?type=enterprise">
            <button className="btn-primary" style={{ width: 'auto', padding: '14px 32px', fontSize: '15px' }}>
              Sou uma empresa
            </button>
          </Link>
          <Link href="/auth/login?type=volunteer">
            <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: '15px' }}>
              Sou voluntário
            </button>
          </Link>
        </div>

        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
          Não tem conta?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Cadastre-se grátis
          </Link>
        </p>
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '80px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {['IA para matching', 'Aprovação humana', 'Notificações em tempo real', 'Substituição automática'].map(
          (f) => (
            <span key={f} className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 16px' }}>
              {f}
            </span>
          )
        )}
      </div>
    </main>
  )
}
