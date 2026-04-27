'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { enterpriseApi, EnterpriseUser } from '@/lib/api'

export default function EnterprisePerfilPage() {
  const { user, logout } = useAuth()
  const enterprise = user as EnterpriseUser | null

  const [name, setName] = useState(enterprise?.name || '')
  const [contactEmail, setContactEmail] = useState(enterprise?.contactEmail || '')
  const [contactPhone, setContactPhone] = useState(enterprise?.contactPhone || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!enterprise?.id) return
    setLoading(true); setSuccess(''); setError('')
    try {
      const data: any = { name, contactEmail, contactPhone }
      if (password) data.password = password
      await enterpriseApi.update(enterprise.id, data)
      setSuccess('Perfil atualizado com sucesso!')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!enterprise?.id) return
    if (!confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível.')) return
    await enterpriseApi.delete(enterprise.id).catch(() => null)
    logout()
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Perfil</h1>
      <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '32px' }}>
        Gerencie as informações da sua empresa
      </p>

      {/* Info card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--accent-dim)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏢</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{enterprise?.name}</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>{enterprise?.email}</p>
          </div>
        </div>
        <div style={{ background: 'var(--bg-3)', borderRadius: '10px', padding: '12px 16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>CNPJ</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{enterprise?.cnpj}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Editar informações</h3>

        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Nome da empresa</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Email de contato dos voluntários</label>
          <input className="input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>Telefone de contato</label>
          <input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', display: 'block' }}>
            Nova senha <span style={{ color: 'var(--text-3)' }}>(deixe em branco para manter)</span>
          </label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px', color: 'var(--success)', fontSize: '13px' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <div className="card" style={{ marginTop: '24px', borderColor: 'rgba(239,68,68,0.2)' }}>
        <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: 'var(--danger)' }}>Zona de perigo</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', marginBottom: '16px' }}>
          Deletar sua conta é permanente e irá remover todos os dados.
        </p>
        <button className="btn-danger" onClick={handleDelete}>Deletar minha conta</button>
      </div>
    </div>
  )
}
