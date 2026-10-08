'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function SalaryAIPage() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    jobTitle: '',
    experience: user?.experience || 'fresher',
    skills: user?.skills?.join(', ') || '',
    location: user?.location || 'Bangalore',
    companySize: 'startup',
    currentSalary: '',
  })

  const handleAnalyze = async () => {
    if (!form.jobTitle.trim()) { toast.error('Enter a job title'); return }
    setLoading(true)
    try {
      const { data } = await API.post('/ai/salary', form)
      setResult(data)
    } catch (err) {
      toast.error('Failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, fontFamily: 'Inter, sans-serif' }}>
          ← Back
        </button>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', color: '#22c55e', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
            💰 Unique to DevHire
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>
            Salary Negotiation AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Know exactly what salary to ask for — personalized to your profile
          </p>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Job Title *</label>
              <input type="text" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} placeholder="React Developer" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Experience</label>
              <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} style={{...inputStyle, cursor: 'pointer'}}>
                <option value="fresher">Fresher (0 years)</option>
                <option value="1-2 years">1-2 Years</option>
                <option value="2-5 years">2-5 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Bangalore, Mumbai, Kolkata" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Company Size</label>
              <select value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})} style={{...inputStyle, cursor: 'pointer'}}>
                <option value="startup">Startup (1-50)</option>
                <option value="mid">Mid-size (50-500)</option>
                <option value="large">Large (500+)</option>
                <option value="mnc">MNC / FAANG</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Your Skills</label>
            <input type="text" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="React, Node.js, MongoDB, Next.js" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Current / Last Salary (₹/year) — optional</label>
            <input type="text" value={form.currentSalary} onChange={e => setForm({...form, currentSalary: e.target.value})} placeholder="Leave blank if fresher" style={inputStyle} />
          </div>

          <button onClick={handleAnalyze} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#1e293b' : 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '12px', color: loading ? '#475569' : 'white', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {loading ? '💰 Calculating...' : '💰 Get My Salary Range'}
          </button>
        </div>

        {loading && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #334155', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '16px' }}>Analyzing market data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Main salary card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,163,74,0.1))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '32px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Recommended salary range for {form.jobTitle}</p>
              <p style={{ color: '#22c55e', fontWeight: '900', fontSize: '36px', marginBottom: '4px' }}>
                {result.minSalary} — {result.maxSalary}
              </p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>per year • {form.location} • {form.companySize}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>DON'T ACCEPT BELOW</p>
                  <p style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '22px' }}>{result.floorSalary}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>AIM FOR</p>
                  <p style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '22px' }}>{result.targetSalary}</p>
                </div>
              </div>
            </div>

            {/* Negotiation script */}
            {result.script && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                  🗣️ What to Say When They Ask Your Expectation
                </h3>
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', border: '1px solid #334155', borderLeft: '3px solid #22c55e' }}>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', fontStyle: 'italic' }}>
                    "{result.script}"
                  </p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.script); toast.success('Copied!') }}
                  style={{ marginTop: '12px', padding: '8px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  📋 Copy Script
                </button>
              </div>
            )}

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                  💡 Negotiation Tips
                </h3>
                {result.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                    <span style={{ color: '#22c55e', flexShrink: 0, fontWeight: '700' }}>{i + 1}.</span>
                    {tip}
                  </div>
                ))}
              </div>
            )}

            {/* Skills that earn more */}
            {result.highValueSkills?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                  🚀 Learn These to Earn ₹2-5L More
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>High-demand skills for {form.jobTitle} roles</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.highValueSkills.map(skill => (
                    <span key={skill} style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', color: '#22c55e', fontSize: '13px', fontWeight: '600' }}>
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setResult(null)} style={{ padding: '12px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#64748b', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Calculate Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}