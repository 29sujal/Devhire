'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token   = searchParams.get('token')
    const userId  = searchParams.get('userId')
    const name    = searchParams.get('name')
    const email   = searchParams.get('email')
    const role    = searchParams.get('role')
    const avatar  = searchParams.get('avatar')
    const error   = searchParams.get('error')
    const isNew   = searchParams.get('isNew')
    const isPremium = searchParams.get('isPremium') === 'true'

    if (error) {
      toast.error('Google sign in failed. Please try again.')
      router.push('/login')
      return
    }

    if (token && userId) {
      const userData = { _id: userId, name, email, role, avatar, token, isPremium}
      dispatch(setUser(userData))

      // New Google user → go to role selection page
      if (isNew === 'true') {
        toast.success(`Welcome to DevHire, ${name}! 🎉`)
        router.push(`/auth/select-role?token=${token}&userId=${userId}`)
      } else {
        toast.success(`Welcome back, ${name}!`)
        if (role === 'company') router.push('/dashboard/company')
        else router.push('/dashboard/seeker')
      }
    } else {
      toast.error('Something went wrong.')
      router.push('/login')
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600' }}>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f172a' }} />}>
      <CallbackHandler />
    </Suspense>
  )
}