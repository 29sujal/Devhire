'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'seeker'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) {
      e.name = 'Name must be at least 2 characters'
    }
    if (!form.email.match(/^\S+@\S+\.\S+$/)) {
      e.email = 'Enter a valid email'
    }
    if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters'
    }
    return e
  }

  const handleChange = (evt) => {
    setForm({ ...form, [evt.target.name]: evt.target.value })
    if (errors[evt.target.name]) {
      setErrors({ ...errors, [evt.target.name]: '' })
    }
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      return setErrors(errs)
    }
    setLoading(true)
    try {
      const { data } = await API.post('/auth/register', form)
      dispatch(setUser(data))
      toast.success('Welcome to DevHire! 🎉')
      if (data.role === 'company') {
        router.push('/dashboard/company')
      } else {
        router.push('/dashboard/seeker')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = [
    'w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-colors',
    'bg-slate-900 border border-slate-700 placeholder-slate-600',
    'focus:border-blue-500',
  ].join(' ')

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
              D
            </div>
            <span className="text-2xl font-black text-white">
              Dev<span className="text-blue-400">Hire</span>
            </span>
          </Link>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-1">
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-7">
            Join thousands of developers and companies
          </p>

          <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
            {['seeker', 'company'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={[
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none',
                  form.role === r
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 bg-transparent',
                ].join(' ')}
              >
                {r === 'seeker' ? '👨‍💻 Job Seeker' : '🏢 Company'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { window.location.href = '/api/auth/google' }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm transition-all mb-5 cursor-pointer border-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Sujal Yadav"
                className={inputClass}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className={inputClass}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {loading
                ? 'Creating account...'
                : form.role === 'company'
                ? 'Create Company Account'
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}