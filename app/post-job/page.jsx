'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function PostJobPage() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [step, setStep] = useState(1) // 1=details, 2=payment

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    location: '',
    jobType: 'full-time',
    experience: 'fresher',
    salaryMin: '',
    salaryMax: '',
  })

  const [errors, setErrors] = useState({})

  // Redirect if not company
  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'company') { router.push('/dashboard/seeker') }
  }, [user])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.description.trim() || form.description.length < 50)
      e.description = 'Description must be at least 50 characters'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.skills.trim()) e.skills = 'At least one skill is required'
    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  // AI Generate Description using Gemini
  const handleAIGenerate = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a job title first')
      return
    }
    setAiLoading(true)
    try {
      const { data } = await API.post('/ai/job-description', {
        title: form.title,
        experience: form.experience,
        skills: form.skills,
        jobType: form.jobType,
      })
      setForm({ ...form, description: data.description })
      toast.success('AI generated description! ✨')
    } catch (err) {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  // Step 1 - Save job as draft
  const handleNext = async () => {
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setStep(2)
  }

  // Step 2 - Razorpay Payment
  const handlePayment = async () => {
    setLoading(true)
    try {
      // Create Razorpay order from backend
      const { data: order } = await API.post('/payment/create-order', {
        amount: 49900, // ₹499 in paise
      })

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: 'INR',
          name: 'DevHire',
          description: 'Job Posting Fee',
          order_id: order.id,
          handler: async (response) => {
            // Payment successful - verify and create job
            try {
              const { data } = await API.post('/payment/verify-and-post', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobData: {
                  title: form.title,
                  description: form.description,
                  requirements: form.requirements
                    .split('\n')
                    .filter((r) => r.trim()),
                  skills: form.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                  location: form.location,
                  jobType: form.jobType,
                  experience: form.experience,
                  salary: {
                    min: Number(form.salaryMin) || 0,
                    max: Number(form.salaryMax) || 0,
                    currency: 'INR',
                  },
                  companyName: user.companyName || user.name,
                  companyLogo: user.companyLogo || '',
                },
              })
              toast.success('Job posted successfully! 🎉')
              router.push('/dashboard/company')
            } catch (err) {
              toast.error('Payment verified but job posting failed')
            }
          },
          prefill: {
            name: user.companyName || user.name,
            email: user.email,
          },
          theme: { color: '#2563eb' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              toast.error('Payment cancelled')
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
      }
    } catch (err) {
      toast.error('Failed to initiate payment')
      setLoading(false)
    }
  }

  const inputClass = {
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

  if (!user || user.role !== 'company') return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 16px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>
            Post a Job
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Reach thousands of qualified developers
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          {[
            { num: 1, label: 'Job Details' },
            { num: 2, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step >= s.num ? '#2563eb' : '#1e293b',
                  border: `2px solid ${step >= s.num ? '#2563eb' : '#334155'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step >= s.num ? 'white' : '#64748b',
                  fontSize: '13px', fontWeight: '700',
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: '600',
                  color: step >= s.num ? '#f1f5f9' : '#64748b',
                }}>
                  {s.label}
                </span>
              </div>
              {i < 1 && (
                <div style={{ width: '60px', height: '1px', background: step > 1 ? '#2563eb' : '#334155' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Job Details */}
        {step === 1 && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '36px' }}>

            {/* Title + AI Button */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={labelStyle}>Job Title *</label>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  style={{
                    padding: '6px 14px',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    border: 'none', borderRadius: '8px',
                    color: 'white', fontSize: '12px', fontWeight: '600',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    opacity: aiLoading ? 0.7 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {aiLoading ? '✨ Generating...' : '✨ AI Generate Description'}
                </button>
              </div>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior React Developer"
                style={inputClass}
              />
              {errors.title && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.title}</p>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Job Description * (min 50 chars)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={6}
                style={{ ...inputClass, resize: 'vertical', minHeight: '140px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.description && <p style={{ color: '#f87171', fontSize: '12px' }}>{errors.description}</p>}
                <p style={{ color: '#64748b', fontSize: '11px', marginLeft: 'auto' }}>
                  {form.description.length} chars
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Requirements (one per line)</label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="3+ years React experience&#10;Strong knowledge of Node.js&#10;Experience with MongoDB"
                rows={4}
                style={{ ...inputClass, resize: 'vertical' }}
              />
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Required Skills * (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Express"
                style={inputClass}
              />
              {errors.skills && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.skills}</p>}
            </div>

            {/* Location + Job Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Bangalore / Remote"
                  style={inputClass}
                />
                {errors.location && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{errors.location}</p>}
              </div>
              <div>
                <label style={labelStyle}>Job Type</label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  style={{ ...inputClass, cursor: 'pointer' }}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Experience + Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Experience</label>
                <select
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  style={{ ...inputClass, cursor: 'pointer' }}
                >
                  <option value="fresher">Fresher</option>
                  <option value="1-2 years">1-2 Years</option>
                  <option value="2-5 years">2-5 Years</option>
                  <option value="5+ years">5+ Years</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Min Salary (₹/year)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="300000"
                  style={inputClass}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Salary (₹/year)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="600000"
                  style={inputClass}
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '36px' }}>

            {/* Job Preview */}
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '20px' }}>
              Review Your Job Listing
            </h2>

            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>
                {form.title}
              </h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>📍 {form.location}</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>💼 {form.jobType}</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>⭐ {form.experience}</span>
              </div>
              {form.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} style={{
                      padding: '4px 12px', background: '#1e293b',
                      border: '1px solid #334155', borderRadius: '8px',
                      color: '#94a3b8', fontSize: '12px',
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {form.description}
              </p>
            </div>

            {/* Pricing */}
            <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px' }}>Job Posting Fee</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                    Your job will be live for 30 days
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '28px' }}>₹499</p>
                  <p style={{ color: '#64748b', fontSize: '12px' }}>one time</p>
                </div>
              </div>

              {/* What you get */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  '✅ Listed for 30 days',
                  '✅ Unlimited applications',
                  '✅ Featured in search results',
                  '✅ Real time notifications',
                ].map((f) => (
                  <p key={f} style={{ color: '#94a3b8', fontSize: '12px' }}>{f}</p>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, padding: '14px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '12px', color: '#94a3b8',
                  fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                  flex: 2, padding: '14px',
                  background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', borderRadius: '12px',
                  color: 'white', fontSize: '15px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {loading ? 'Processing...' : '💳 Pay ₹499 & Post Job'}
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '16px' }}>
              🔒 Secured by Razorpay — UPI, Cards, Net Banking accepted
            </p>
          </div>
        )}
      </div>
    </div>
  )
}