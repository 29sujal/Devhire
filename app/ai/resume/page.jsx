'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function AIResumePage() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [resumeFile, setResumeFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Check premium access
  if (user && !user.isPremium) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</p>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>Premium Feature</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px', lineHeight: '1.6' }}>
            AI Resume Analyzer is available for Premium members only. Upgrade to get instant AI feedback on your resume.
          </p>
          <button
            onClick={() => router.push('/premium')}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            ⭐ Upgrade to Premium
          </button>
        </div>
      </div>
    )
  }

  const extractTextFromFile = async (file) => {
    // For text-based PDFs and docs, read as text
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        // Clean up binary characters, keep readable text
        const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        resolve(cleaned)
      }
      reader.readAsText(file)
    })
  }

  const handleAnalyze = async (retryCount = 0) => {
  if (!resumeFile) { toast.error('Please upload your resume'); return }
  setLoading(true)
  setResult(null)
  try {
    const resumeText = await extractTextFromFile(resumeFile)
    const formData = new FormData()
    formData.append('jobTitle', jobTitle || 'Full Stack Developer')
    formData.append('resumeText', resumeText)

    const { data } = await API.post('/ai/resume-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setResult(data)
    setLoading(false)
    toast.success('Analysis complete! ✨')
  } catch (err) {
    if (retryCount < 2) {
      // Auto retry after 2 seconds
      toast.loading(`AI busy, retrying... (${retryCount + 1}/2)`, { duration: 2000 })
      setTimeout(() => handleAnalyze(retryCount + 1), 2000)
    } else {
      setLoading(false)
      toast.error('AI is busy right now. Please try again in a moment.')
    }
  }
}

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={() => router.push('/dashboard/seeker')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, fontFamily: 'Inter, sans-serif' }}>
          ← Back to Dashboard
        </button>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '999px', color: '#eab308', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
            ⭐ Premium Feature
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>🤖 AI Resume Analyzer</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Get instant AI-powered feedback to improve your chances</p>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Target Job Role</label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Developer, React Developer" style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Upload Resume *</label>
            <div onClick={() => document.getElementById('resume-ai-upload').click()} style={{ padding: '32px', background: '#0f172a', border: '2px dashed #334155', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
              {resumeFile ? (
                <div>
                  <p style={{ fontSize: '28px', marginBottom: '8px' }}>✅</p>
                  <p style={{ color: '#22c55e', fontWeight: '600', fontSize: '15px' }}>{resumeFile.name}</p>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>Click to change</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '36px', marginBottom: '12px' }}>📄</p>
                  <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Click to upload your resume</p>
                  <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>PDF recommended (text-based, not scanned)</p>
                </div>
              )}
            </div>
            <input id="resume-ai-upload" type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={(e) => setResumeFile(e.target.files[0])} />
          </div>

          <button onClick={handleAnalyze} disabled={loading || !resumeFile} style={{ width: '100%', padding: '14px', background: loading || !resumeFile ? '#1e293b' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: loading || !resumeFile ? '#475569' : 'white', fontSize: '15px', fontWeight: '700', cursor: loading || !resumeFile ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {loading ? '🤖 Analyzing...' : '✨ Analyze My Resume'}
          </button>
        </div>

        {loading && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>AI is analyzing your resume...</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>This may take 15-20 seconds</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: `conic-gradient(${result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444'} ${result.score * 3.6}deg, #334155 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '22px' }}>{result.score}</span>
                </div>
              </div>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '22px', marginBottom: '6px' }}>Score: {result.score}/100</p>
                <p style={{ color: result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444', fontSize: '15px', fontWeight: '600' }}>
                  {result.score >= 70 ? '✅ Strong resume — ready to apply!' : result.score >= 50 ? '⚠️ Good start — needs improvement' : '❌ Needs significant improvement'}
                </p>
              </div>
            </div>

            {result.strengths?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#22c55e', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>✅ Strengths</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.improvements?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#eab308', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>⚠️ Areas to Improve</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                      <span style={{ color: '#eab308', flexShrink: 0 }}>→</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#3b82f6', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>💡 Skills to Add for {jobTitle || 'this role'}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.missingSkills.map((skill) => (
                    <span key={skill} style={{ padding: '5px 14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', color: '#3b82f6', fontSize: '13px' }}>+ {skill}</span>
                  ))}
                </div>
              </div>
            )}

            {result.feedback && (
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>🤖 AI Verdict</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>{result.feedback}</p>
              </div>
            )}

            <button onClick={() => setResult(null)} style={{ padding: '12px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#64748b', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Analyze Another Resume
            </button>
          </div>
        )} 
      </div>
    </div>
  )
}