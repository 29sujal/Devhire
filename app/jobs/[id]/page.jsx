'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [appForm, setAppForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    experience: 'fresher',
    noticePeriod: 'immediate',
    currentSalary: '',
    expectedSalary: '',
    portfolio: '',
    linkedin: '',
    resumeFile: null,
  })

  useEffect(() => {
    if (id) fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const { data } = await API.get(`/jobs/${id}`)
      setJob(data.job)
      setApplied(data.hasApplied)
    } catch (err) {
      toast.error('Job not found')
      router.push('/jobs')
    } finally {
      setLoading(false)
    }
  }

  // AI Generate Cover Letter
  const handleAICoverLetter = async () => {
    if (!user) { toast.error('Please login first'); return }
    setAiLoading(true)
    try {
      const { data } = await API.post('/ai/cover-letter', {
        jobTitle: job.title,
        companyName: job.companyName,
        skills: job.skills,
        experience: job.experience,
        userName: user.name,
      })
      setCoverLetter(data.coverLetter)
      toast.success('AI generated cover letter! ✨')
    } catch (err) {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply')
      router.push('/login')
      return
    }
    if (user.role === 'company') {
      toast.error('Companies cannot apply for jobs')
      return
    }
    setShowModal(true)
  }

  const handleSubmitApplication = async () => {
    // Validate required fields
    if (!appForm.fullName.trim()) { toast.error('Full name is required'); return }
    if (!appForm.email.trim()) { toast.error('Email is required'); return }
    if (!appForm.phone.trim()) { toast.error('Phone number is required'); return }
    if (!appForm.resumeFile) { toast.error('Please upload your resume'); return }

    setApplying(true)
    try {
      // Upload resume to Cloudinary first
      let resumeUrl = ''
      if (appForm.resumeFile) {
        const formData = new FormData()
        formData.append('file', appForm.resumeFile)
        const uploadRes = await API.post('/upload/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        resumeUrl = uploadRes.data.url
      }

      await API.post('/applications', {
        jobId: id,
        coverLetter,
        resumeUrl,
        applicantDetails: {
          fullName: appForm.fullName,
          email: appForm.email,
          phone: appForm.phone,
          experience: appForm.experience,
          noticePeriod: appForm.noticePeriod,
          currentSalary: appForm.currentSalary,
          expectedSalary: appForm.expectedSalary,
          portfolio: appForm.portfolio,
          linkedin: appForm.linkedin,
        }
      })
      toast.success('Application submitted! 🎉')
      setApplied(true)
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed'
    if (salary.min && salary.max) {
      return `₹${(salary.min / 100000).toFixed(0)}L - ₹${(salary.max / 100000).toFixed(0)}L per year`
    }
    return `₹${((salary.min || salary.max) / 100000).toFixed(0)}L per year`
  }

  const timeAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    return `${Math.floor(days / 7)} weeks ago`
  }

  const typeColors = {
    'full-time': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
    'part-time': { bg: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.2)' },
    'remote': { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
    'internship': { bg: 'rgba(168,85,247,0.1)', color: '#a855f7', border: 'rgba(168,85,247,0.2)' },
    'contract': { bg: 'rgba(249,115,22,0.1)', color: '#f97316', border: 'rgba(249,115,22,0.2)' },
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748b' }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading job...
      </div>
    )
  }

  if (!job) return null

  const typeStyle = typeColors[job.jobType] || typeColors['full-time']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => router.push('/jobs')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: '0', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Jobs
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* Left — Job Details */}
          <div>

            {/* Job Header Card */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', marginBottom: '20px' }}>

              {/* Company + Type */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '22px' }}>
                      {job.companyName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>{job.companyName}</p>
                    <p style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>Posted {timeAgo(job.createdAt)}</p>
                  </div>
                </div>
                <span style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                  {job.jobType}
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '16px', lineHeight: '1.2' }}>
                {job.title}
              </h1>

              {/* Meta info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                {[
                  { icon: '📍', text: job.location },
                  { icon: '💼', text: job.experience },
                  { icon: '💰', text: formatSalary(job.salary) },
                  { icon: '👥', text: `${job.applicationCount || 0} applicants` },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '14px' }}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.skills.map((skill) => (
                    <span key={skill} style={{ padding: '5px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '13px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>
                Job Description
              </h2>
              <div
                style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{
                  __html: job.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/^\* (.+)$/gm, '<div style="display:flex;gap:8px;margin:6px 0"><span style="color:#3b82f6;flex-shrink:0">•</span><span>$1</span></div>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>
                  Requirements
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {job.requirements.map((req, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#94a3b8', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6' }}>
                      <span style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }}>✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — Apply Card (Sticky) */}
          <div style={{ position: 'sticky', top: '84px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' }}>
                Interested in this role?
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                Apply now and hear back within 7 days
              </p>

              {/* Apply Button */}
              {applied ? (
                <div style={{ width: '100%', padding: '14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#22c55e', fontSize: '15px', fontWeight: '700', textAlign: 'center' }}>
                  ✓ Applied Successfully
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '12px' }}
                >
                  Apply Now →
                  {/* Interview Prep Button */}
                  <a
                    href={`/ai/interview-prep?jobId=${id}`}
                    style={{ display: 'block', width: '100%', padding: '11px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '10px', color: '#a855f7', fontSize: '13px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', marginTop: '10px' }}
                  >
                    🎯 Prep for This Interview
                  </a>
                </button>

              )}

              {!user && (
                <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                  <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Login</a> to apply for this job
                </p>
              )}

              {/* Job Info Summary */}
              <div style={{ borderTop: '1px solid #334155', marginTop: '20px', paddingTop: '20px' }}>
                {[
                  { label: 'Job Type', value: job.jobType },
                  { label: 'Experience', value: job.experience },
                  { label: 'Location', value: job.location },
                  { label: 'Salary', value: formatSalary(job.salary) },
                  { label: 'Applicants', value: `${job.applicationCount || 0} applied` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{item.label}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', textAlign: 'right', maxWidth: '150px' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px', margin: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>
                Apply for {job.title}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px' }}>×</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>{job.companyName}</p>

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={appForm.fullName}
                onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                placeholder="Sujal Yadav"
                style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Email *</label>
                <input
                  type="email"
                  value={appForm.email}
                  onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Phone *</label>
                <input
                  type="tel"
                  value={appForm.phone}
                  onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Experience + Notice Period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Years of Experience</label>
                <select
                  value={appForm.experience}
                  onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="fresher">Fresher (0 years)</option>
                  <option value="less-than-1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Notice Period</label>
                <select
                  value={appForm.noticePeriod}
                  onChange={(e) => setAppForm({ ...appForm, noticePeriod: e.target.value })}
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="immediate">Immediate</option>
                  <option value="15-days">15 Days</option>
                  <option value="30-days">30 Days</option>
                  <option value="60-days">60 Days</option>
                  <option value="90-days">90 Days</option>
                </select>
              </div>
            </div>

            {/* Current Salary + Expected Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Current Salary (₹/year)</label>
                <input
                  type="text"
                  value={appForm.currentSalary}
                  onChange={(e) => setAppForm({ ...appForm, currentSalary: e.target.value })}
                  placeholder="e.g. 400000 or Fresher"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Expected Salary (₹/year)</label>
                <input
                  type="text"
                  value={appForm.expectedSalary}
                  onChange={(e) => setAppForm({ ...appForm, expectedSalary: e.target.value })}
                  placeholder="e.g. 600000"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Portfolio + LinkedIn */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>GitHub / Portfolio URL</label>
                <input
                  type="url"
                  value={appForm.portfolio}
                  onChange={(e) => setAppForm({ ...appForm, portfolio: e.target.value })}
                  placeholder="github.com/username"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>LinkedIn URL</label>
                <input
                  type="url"
                  value={appForm.linkedin}
                  onChange={(e) => setAppForm({ ...appForm, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  style={{ width: '100%', padding: '11px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Resume (PDF) *
              </label>
              <div
                onClick={() => document.getElementById('resume-upload').click()}
                style={{ width: '100%', padding: '20px', background: '#0f172a', border: '2px dashed #334155', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              >
                {appForm.resumeFile ? (
                  <div>
                    <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>✅ {appForm.resumeFile.name}</p>
                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '24px', marginBottom: '8px' }}>📄</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Click to upload resume</p>
                    <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>PDF, DOC up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file && file.size > 5 * 1024 * 1024) {
                    toast.error('File size must be less than 5MB')
                    return
                  }
                  setAppForm({ ...appForm, resumeFile: file })
                }}
              />
            </div>

            {/* Cover Letter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Cover Letter (Optional)
                </label>
                <button
                  onClick={handleAICoverLetter}
                  disabled={aiLoading}
                  style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '7px', color: 'white', fontSize: '11px', fontWeight: '600', cursor: aiLoading ? 'not-allowed' : 'pointer', opacity: aiLoading ? 0.7 : 1, fontFamily: 'Inter, sans-serif' }}
                >
                  {aiLoading ? '✨ Generating...' : '✨ AI Write Cover Letter'}
                </button>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the company why you're a great fit..."
                rows={4}
                style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applying}
                style={{ flex: 2, padding: '13px', background: applying ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: applying ? 'not-allowed' : 'pointer', opacity: applying ? 0.7 : 1, fontFamily: 'Inter, sans-serif' }}
              >
                {applying ? 'Submitting...' : 'Submit Application →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}