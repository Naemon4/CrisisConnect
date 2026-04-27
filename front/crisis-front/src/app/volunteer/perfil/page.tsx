'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { volunteerApi, Volunteer, VolunteerUser } from '@/lib/api'
import { SKILLS_OPTIONS, STATES, skillLabel } from '@/lib/constants'

export default function VolunteerPerfilPage() {
  const { user, logout } = useAuth()
  const vUser = user as VolunteerUser | null
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)

  const [fullName, setFullName] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!vUser?.id) return
    volunteerApi.findOne(vUser.id).then((v) => {
      setVolunteer(v)
      setFullName(v.fullName)
      setState(v.state)
      setCity(v.city)
      setSkills(v.skills)
    })
  }, [vUser?.id])

  function toggleSkill(v: string) {
    setSkills((p) => p.includes(v) ? p.filter((s) => s !== v) : [...p, v])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!volunteer) return
    if (skills.length === 0) { setError('Selecione pelo menos uma habilidade'); return }
    setLoading(true); setSuccess(''); setError('')
    try {
      const data: any = { fullName, state, city, skills }
      if (password) data.password = password
      await volunteerApi.update(volunteer.id, data)
      setSuccess('Perfil atualizado!')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!volunteer) return
    if (!confirm('Deletar sua conta? Ação irreversível.')) return
    await volunteerApi.delete(volunteer.id).catch(() => null)
    logout()
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Meu Perfil</h1>
      <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '32px' }}>
        Mantenha seus dados atualizados para ser encontrado pelas empresas certas
      </p>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>
            {volunteer?.fullName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{volunteer?.fullName}</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>{volunteer?.email}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--bg-3)', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>CPF</p>
            <p style={{ fontSize: '14px' }}>{volunteer?.cpf}</p>
          </div>
          <div style={{ background: 'var(--bg-3)', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>Localização</p>
            <p style={{ fontSize: '14px' }}>{volunteer?.city}, {volunteer?.state}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontWeight: 600, fontSize: '15px' }}>Editar perfil</h3>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Nome completo</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Estado</label>
            <select className="input" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">UF</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Cidade</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px', display: 'block' }}>
            Habilidades <span style={{ color: 'var(--text-3)' }}>({skills.length} selecionadas)</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SKILLS_OPTIONS.map((s) => (
              <button key={s.value} type="button" onClick={() => toggleSkill(s.value)} className={`skill-chip ${skills.includes(s.value) ? 'selected' : ''}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
            Nova senha <span style={{ color: 'var(--text-3)' }}>(deixe em branco para manter)</span>
          </label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px', color: 'var(--success)', fontSize: '13px' }}>{success}</div>}
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <div className="card" style={{ marginTop: '24px', borderColor: 'rgba(239,68,68,0.2)' }}>
        <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: 'var(--danger)' }}>Zona de perigo</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', marginBottom: '16px' }}>
          Deletar sua conta irá remover todos os seus dados permanentemente.
        </p>
        <button className="btn-danger" onClick={handleDelete}>Deletar minha conta</button>
      </div>
    </div>
  )
}
