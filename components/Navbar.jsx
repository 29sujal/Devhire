'use client'

import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '@/store/slices/authSlice'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only show user-specific content after client mounts
  // This prevents server/client mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    dispatch(clearUser())
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'company') return '/dashboard/company'
    if (user.role === 'admin') return '/dashboard/admin'
    return '/dashboard/seeker'
  }

  const linkStyle = {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  }

  return (
    <nav suppressHydrationWarning style={{
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '14px'
          }}>D</div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#f1f5f9' }}>
            Dev<span style={{ color: '#60a5fa' }}>Hire</span>
          </span>
        </a>

        {/* Desktop Links — only render after mount to avoid hydration mismatch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/jobs" style={linkStyle}>Browse Jobs</a>

          {/* Before mount — show nothing to avoid mismatch */}
          {!mounted ? null : !user ? (
            <>
              <a href="/login" style={linkStyle}>Sign In</a>
              <a href="/register" style={{
                padding: '8px 18px',
                background: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Get Started
              </a>
            </>
          ) : (
            <>
              <a href={getDashboardLink()} style={linkStyle}>Dashboard</a>
              <NotificationBell />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#2563eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '13px', fontWeight: '700'
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}