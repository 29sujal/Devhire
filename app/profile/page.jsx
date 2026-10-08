'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function EditProfilePage() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    title: '',
    bio: '',
    location: '',
    skills: '',
    experience: 'fresher',
    github: '',
    linkedin: '',
    portfolio: '',
  })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role === 'company') { router.push('/company/profile'); return }
    setForm({
      name: user.name || '',
      title: user.title || '',
      bio: user.bio || '',
      location: user.location || '',
      skills: user.skills?.join(', ') || '',
      experience: user.experience || 'fresher',
      github: user.github || '',
      linkedin: user.linkedin || '',
      portfolio: user.portfolio || '',
    })
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }

    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await API.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      dispatch(setUser({ ...user, avatar: data.url }))
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error('Failed to upload photo')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const { data } = await API.put('/profile/seeker', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      dispatch(setUser({ ...user, ...data.user }))
      toast.success('Profile updated! ✅')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#0f172a', border: '1px solid #334155',
    borderRadius: '10px', color: '#f1f5f9',
    fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: '8px',
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <button onClick={() => router.push('/dashboard/seeker')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, fontFamily: 'Inter, sans-serif' }}>
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>Edit Profile</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Companies see this when they view your profile
        </p>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '36px' }}>

          {/* Avatar Upload */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #334155' }} />
              ) : (
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '36px' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' }}>
                {avatarLoading ? '...' : '📷'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
            </div>
            <p style={{ color: '#475569', fontSize: '12px', marginTop: '10px' }}>Click the camera icon to change photo</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Name + Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sujal Yadav" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Professional Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Full Stack Developer" style={inputStyle} />
              </div>
            </div>

            {/* Location + Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kolkata, India" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="fresher">Fresher</option>
                  <option value="1-2 years">1-2 Years</option>
                  <option value="2-5 years">2-5 Years</option>
                  <option value="5+ years">5+ Years</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Skills (comma separated)</label>
              <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, MongoDB, Express, Next.js" style={inputStyle} />
              {/* Skill preview */}
              {form.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {form.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} style={{ padding: '3px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', color: '#3b82f6', fontSize: '12px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Bio / About Me</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell companies about yourself, your experience, and what you're looking for..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Social Links */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>GitHub URL</label>
              <input type="url" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/yourusername" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input type="url" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Portfolio URL</label>
                <input type="url" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://yourportfolio.com" style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}