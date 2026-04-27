'use client'

import Sidebar from '@/components/shared/Sidebar'

const NAV = [
  { href: '/enterprise/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/enterprise/acoes', label: 'Ações de Crise', icon: '🚨' },
  { href: '/enterprise/perfil', label: 'Perfil', icon: '🏢' },
]

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={NAV} title="Empresa" />
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
