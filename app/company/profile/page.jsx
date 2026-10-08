'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function CompanyProfilePage() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    location: '',
    industry: '',
    size: '',
    founded: '',
  })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'company') { router.push('/dashboard/seeker'); return }
    setForm({
      companyName: user.companyName || '',
      companyWebsite: user.companyWebsite || '',
      companyDescription: user.companyDescription || '',
      location: user.location || '',
      industry: user.industry || '',
      size: user.size || '',
      founded: user.founded || '',
    })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await API.put('/profile/company', form)
      dispatch(setUser({ ...user, ...data.user }))
      toast.success('Company profile updated!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <button onClick={() => router.push('/dashboard/company')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, fontFamily: 'Inter, sans-serif' }}>
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>
          Company Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          This information appears on your job listings
        </p>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '36px' }}>
          <form onSubmit={handleSubmit}>

            {/* Company Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Company Name *</label>
              <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Acme Technologies" style={inputStyle} />
            </div>

            {/* Website + Industry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Website</label>
                <input type="url" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} placeholder="https://yourcompany.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Startup">Startup</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Location + Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bangalore, India" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Company Size</label>
                <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            {/* Founded */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Founded Year</label>
              <input type="number" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })} placeholder="2020" min="1900" max="2026" style={inputStyle} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Company Description</label>
              <textarea
                value={form.companyDescription}
                onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                placeholder="Tell candidates about your company, culture, and what makes you a great place to work..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : 'Save Company Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}