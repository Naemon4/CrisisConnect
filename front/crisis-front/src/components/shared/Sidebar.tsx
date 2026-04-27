'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface SidebarProps {
  items: NavItem[]
  title?: string
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user
    ? ('name' in user ? user.name : (user as any).fullName || '')
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  const displayName = user
    ? 'name' in user
      ? user.name
      : (user as any).fullName
    : ''

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '40px',
          padding: '0 4px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          ⚡
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
          CrisisLink
        </span>
      </Link>

      {title && (
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 14px',
            marginBottom: '8px',
          }}
        >
          {title}
        </p>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          marginTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            marginBottom: '4px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent-dim)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </p>
          </div>
        </div>
        <button className="sidebar-link" onClick={logout} style={{ color: 'var(--danger)' }}>
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
