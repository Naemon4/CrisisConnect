'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

function LoginForm() {
  const searchParams = useSearchParams()
  const [type, setType] = useState<'enterprise' | 'volunteer'>(
    (searchParams.get('type') as any) || 'enterprise'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginVolunteer, loginEnterprise, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const userType = localStorage.getItem('userType')
      router.replace(userType === 'volunteer' ? '/volunteer/dashboard' : '/enterprise/dashboard')
    }
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (type === 'volunteer') {
        await loginVolunteer(email, password)
      } else {
        await loginEnterprise(email, password)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }} className="fade-in">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⚡
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>CrisisLink</span>
        </Link>

        <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Entrar</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '32px' }}>
          Acesse sua conta para continuar
        </p>

        {/* Type toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-3)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '28px',
            border: '1px solid var(--border)',
          }}
        >
          {(['enterprise', 'volunteer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: type === t ? 'var(--accent)' : 'transparent',
                color: type === t ? '#fff' : 'var(--text-2)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'enterprise' ? '🏢 Empresa' : '🙋 Voluntário'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
              Senha
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: 'var(--danger)',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
          Não tem conta?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
