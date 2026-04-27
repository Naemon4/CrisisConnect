'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { volunteerApi, enterpriseApi } from '@/lib/api'
import { SKILLS_OPTIONS, STATES } from '@/lib/constants'

type AccountType = 'enterprise' | 'volunteer'

export default function RegisterPage() {
  const [type, setType] = useState<AccountType>('enterprise')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Shared
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Enterprise
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Volunteer
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [skills, setSkills] = useState<string[]>([])

  function toggleSkill(v: string) {
    setSkills((prev) => prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (type === 'enterprise') {
        await enterpriseApi.register({ name, email, password, cnpj, contactEmail, contactPhone })
      } else {
        if (skills.length === 0) throw new Error('Selecione pelo menos uma habilidade')
        await volunteerApi.register({ fullName, email, password, cpf, state, city, skills })
      }
      router.push(`/auth/login?type=${type}`)
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
      <div style={{ width: '100%', maxWidth: '520px' }} className="fade-in">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>CrisisLink</span>
        </Link>

        <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Criar conta</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '32px' }}>
          Escolha o tipo de conta para começar
        </p>

        {/* Type toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-3)', borderRadius: '12px', padding: '4px', marginBottom: '32px', border: '1px solid var(--border)' }}>
          {(['enterprise', 'volunteer'] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: type === t ? 'var(--accent)' : 'transparent', color: type === t ? '#fff' : 'var(--text-2)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {t === 'enterprise' ? '🏢 Empresa' : '🙋 Voluntário'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Shared fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Email</label>
              <input className="input" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Senha</label>
              <input className="input" type="password" placeholder="min. 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
          </div>

          {type === 'enterprise' ? (
            <>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Nome da empresa</label>
                <input className="input" placeholder="Razão social" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>CNPJ</label>
                <input className="input" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Email de contato dos voluntários</label>
                  <input className="input" type="email" placeholder="contato@empresa.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Telefone de contato</label>
                  <input className="input" placeholder="(11) 99999-9999" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Nome completo</label>
                <input className="input" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>CPF</label>
                <input className="input" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Estado</label>
                  <select className="input" value={state} onChange={(e) => setState(e.target.value)} required>
                    <option value="">UF</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Cidade</label>
                  <input className="input" placeholder="Sua cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px', display: 'block' }}>
                  Habilidades <span style={{ color: 'var(--text-3)' }}>({skills.length} selecionadas)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SKILLS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSkill(s.value)}
                      className={`skill-chip ${skills.includes(s.value) ? 'selected' : ''}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
          Já tem conta?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
