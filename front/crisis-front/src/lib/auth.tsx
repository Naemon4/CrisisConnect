'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { volunteerApi, enterpriseApi, VolunteerUser, EnterpriseUser } from './api'

type UserType = 'volunteer' | 'enterprise' | null

interface AuthState {
  user: (VolunteerUser | EnterpriseUser) | null
  userType: UserType
  isLoading: boolean
}

interface AuthContext extends AuthState {
  loginVolunteer: (email: string, password: string) => Promise<void>
  loginEnterprise: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthCtx = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userType: null,
    isLoading: true,
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRaw = localStorage.getItem('user')
    const userType = localStorage.getItem('userType') as UserType

    if (token && userRaw && userType) {
      try {
        const user = JSON.parse(userRaw)
        setState({ user, userType, isLoading: false })
      } catch {
        setState({ user: null, userType: null, isLoading: false })
      }
    } else {
      setState({ user: null, userType: null, isLoading: false })
    }
  }, [])

  async function loginVolunteer(email: string, password: string) {
    const { token, user } = await volunteerApi.login(email, password)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userType', 'volunteer')
    setState({ user, userType: 'volunteer', isLoading: false })
    router.push('/volunteer/dashboard')
  }

  async function loginEnterprise(email: string, password: string) {
    const { token, user } = await enterpriseApi.login(email, password)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userType', 'enterprise')
    setState({ user, userType: 'enterprise', isLoading: false })
    router.push('/enterprise/dashboard')
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    setState({ user: null, userType: null, isLoading: false })
    router.push('/auth/login')
  }

  return (
    <AuthCtx.Provider value={{ ...state, loginVolunteer, loginEnterprise, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
