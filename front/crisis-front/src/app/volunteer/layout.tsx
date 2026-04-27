'use client'

import Sidebar from '@/components/shared/Sidebar'

const NAV = [
  { href: '/volunteer/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/volunteer/notificacoes', label: 'Notificações', icon: '🔔' },
  { href: '/volunteer/perfil', label: 'Meu Perfil', icon: '👤' },
]

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={NAV} title="Voluntário" />
      <main className="main-content">{children}</main>
    </div>
  )
}
