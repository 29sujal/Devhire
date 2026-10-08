'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

function SelectRoleContent() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectRole = async () => {
    if (!selected) { toast.error('Please select a role'); return }
    setLoading(true)
    try {
      const { data } = await API.patch('/auth/update-role', { role: selected })
      dispatch(setUser({ ...user, role: selected }))
      toast.success(`You're all set as a ${selected === 'company' ? 'Company' : 'Job Seeker'}! 🎉`)
      if (selected === 'company') router.push('/dashboard/company')
      else router.push('/dashboard/seeker')
    } catch (err) {
      toast.error('Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '24px', margin: '0 auto 16px' }}>D</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>How will you use DevHire?</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Choose your role to get started</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          {[
            {
              role: 'seeker',
              icon: '👨‍💻',
              title: 'I\'m a Job Seeker',
              desc: 'Browse jobs, apply to positions and track your applications',
              color: '#3b82f6',
            },
            {
              role: 'company',
              icon: '🏢',
              title: 'I\'m a Company / Recruiter',
              desc: 'Post jobs, find talented developers and manage applications',
              color: '#7c3aed',
            },
          ].map((option) => (
            <div
              key={option.role}
              onClick={() => setSelected(option.role)}
              style={{
                padding: '24px',
                background: selected === option.role ? `rgba(${option.role === 'seeker' ? '59,130,246' : '124,58,237'},0.1)` : '#1e293b',
                border: `2px solid ${selected === option.role ? option.color : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '36px', flexShrink: 0 }}>{option.icon}</span>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{option.title}</p>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>{option.desc}</p>
              </div>
              {selected === option.role && (
                <div style={{ marginLeft: 'auto', width: '24px', height: '24px', borderRadius: '50%', background: option.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', flexShrink: 0 }}>✓</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSelectRole}
          disabled={!selected || loading}
          style={{ width: '100%', padding: '14px', background: selected ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#1e293b', border: 'none', borderRadius: '12px', color: selected ? 'white' : '#475569', fontSize: '15px', fontWeight: '700', cursor: selected && !loading ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f172a' }} />}>
      <SelectRoleContent />
    </Suspense>
  )
}