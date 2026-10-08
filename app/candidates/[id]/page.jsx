'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import API from '@/lib/axios'
import toast from 'react-hot-toast'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailType, setEmailType] = useState('interview')
  const [emailContent, setEmailContent] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [application, setApplication] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchCandidate()
  }, [user, id])

  const fetchCandidate = async () => {
    try {
      const { data } = await API.get(`/candidates/${id}`)

      setCandidate(data.candidate)
      setApplication(data.application)
    } catch (err) {
      toast.error('Candidate not found')
      router.push('/candidates')
    } finally {
      setLoading(false)
    }
  }

  const generateAIEmail = async () => {
    if (!candidate) return

    setAiLoading(true)

    try {
      const { data } = await API.post('/ai/candidate-email', {
        candidateName: candidate.name,
        companyName: user.companyName || user.name,
        emailType,
        jobTitle: application?.job?.title || 'the position',
        skills: candidate.skills || [],
      })

      setEmailContent(data.email)

      toast.success('AI email generated! ✨')
    } catch (err) {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailContent.trim()) {
      toast.error('Please generate or write an email first')
      return
    }

    setSending(true)

    try {
      await API.post('/email/send', {
        to: candidate.email,

        subject:
          emailType === 'interview'
            ? `Interview Invitation - ${user.companyName || user.name}`
            : emailType === 'offer'
              ? `Job Offer - ${user.companyName || user.name}`
              : `Application Update - ${user.companyName || user.name}`,

        body: emailContent,
      })

      toast.success('Email sent successfully! 📧')

      setShowEmailModal(false)
      setEmailContent('')
    } catch (err) {
      toast.error('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const statusConfig = {
    applied: {
      label: 'Applied',
      color: '#60a5fa',
      bg: 'rgba(59,130,246,0.15)',
    },

    viewed: {
      label: '👀 Viewed',
      color: '#fbbf24',
      bg: 'rgba(234,179,8,0.15)',
    },

    shortlisted: {
      label: '⭐ Shortlisted',
      color: '#4ade80',
      bg: 'rgba(34,197,94,0.15)',
    },

    rejected: {
      label: '❌ Rejected',
      color: '#f87171',
      bg: 'rgba(239,68,68,0.15)',
    },

    hired: {
      label: '🎉 Hired',
      color: '#c084fc',
      bg: 'rgba(168,85,247,0.15)',
    },
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid #334155',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />

        Loading candidate...

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    )
  }

  if (!candidate) return null

  const currentStatus =
    statusConfig[application?.status] || statusConfig.applied

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >

        {/* Back */}
        <button
          onClick={() => router.push('/candidates')}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '24px',
            padding: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ← Back to Candidates
        </button>

        {/* ================= PROFILE HEADER ================= */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt={candidate.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #334155',
                }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '32px',
                  flexShrink: 0,
                }}
              >
                {candidate.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#f1f5f9',
                  marginBottom: '4px',
                }}
              >
                {candidate.name}
              </h1>

              <p
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  marginBottom: '4px',
                }}
              >
                {candidate.title || 'Full Stack Developer'}
              </p>

              {candidate.location && (
                <p
                  style={{
                    color: '#475569',
                    fontSize: '13px',
                  }}
                >
                  📍 {candidate.location}
                </p>
              )}
            </div>

            {/* Application Status */}
            {application && (
              <span
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: currentStatus.bg,
                  color: currentStatus.color,
                }}
              >
                {currentStatus.label}
              </span>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '10px',
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                📄 View Resume
              </a>
            )}

            <button
              onClick={() => setShowEmailModal(true)}
              style={{
                padding: '10px 20px',
                background:
                  'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ✉️ Send Email
            </button>
          </div>
        </div>

        {/* ================= APPLICATION DETAILS ================= */}
        {application && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '20px',
              }}
            >
              Application Details
            </h2>

            {/* Job */}
            {application.job?.title && (
              <div
                style={{
                  padding: '14px',
                  background: '#0f172a',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid #334155',
                }}
              >
                <p
                  style={{
                    color: '#475569',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    marginBottom: '5px',
                  }}
                >
                  Applied For
                </p>

                <p
                  style={{
                    color: '#f1f5f9',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                >
                  {application.job.title}
                </p>
              </div>
            )}

            {/* Application Information */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {[
                {
                  label: 'Phone',
                  value:
                    application.applicantDetails?.phone || '—',
                },

                {
                  label: 'Experience',
                  value:
                    application.applicantDetails?.experience ||
                    candidate.experience ||
                    '—',
                },

                {
                  label: 'Notice Period',
                  value:
                    application.applicantDetails?.noticePeriod ||
                    '—',
                },

                {
                  label: 'Current Salary',
                  value:
                    application.applicantDetails?.currentSalary
                      ? `₹${Number(
                          application.applicantDetails.currentSalary
                        ).toLocaleString()}`
                      : '—',
                },

                {
                  label: 'Expected Salary',
                  value:
                    application.applicantDetails?.expectedSalary
                      ? `₹${Number(
                          application.applicantDetails.expectedSalary
                        ).toLocaleString()}`
                      : '—',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: '#0f172a',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <p
                    style={{
                      color: '#475569',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                    }}
                  >
                    {item.label}
                  </p>

                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Application Links */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: application.coverLetter
                  ? '16px'
                  : '0',
              }}
            >
              {application.applicantDetails?.linkedin && (
                <a
                  href={application.applicantDetails.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    background:
                      'rgba(59,130,246,0.1)',
                    border:
                      '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  💼 LinkedIn
                </a>
              )}

              {application.applicantDetails?.portfolio && (
                <a
                  href={application.applicantDetails.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    background:
                      'rgba(168,85,247,0.1)',
                    border:
                      '1px solid rgba(168,85,247,0.2)',
                    borderRadius: '8px',
                    color: '#a855f7',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  🌐 Portfolio
                </a>
              )}
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div
                style={{
                  padding: '16px',
                  background: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                }}
              >
                <p
                  style={{
                    color: '#475569',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '10px',
                  }}
                >
                  Cover Letter
                </p>

                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.7',
                  }}
                >
                  {application.coverLetter}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= BIO ================= */}
        {candidate.bio && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '12px',
              }}
            >
              About
            </h2>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                lineHeight: '1.7',
              }}
            >
              {candidate.bio}
            </p>
          </div>
        )}

        {/* ================= SKILLS ================= */}
        {candidate.skills?.length > 0 && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '16px',
              }}
            >
              Skills
            </h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(59,130,246,0.1)',
                    border:
                      '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ================= LINKS ================= */}
        {(candidate.github ||
          candidate.linkedin ||
          candidate.portfolio) && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f1f5f9',
                marginBottom: '16px',
              }}
            >
              Links
            </h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  🔗 GitHub
                </a>
              )}

              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    background:
                      'rgba(59,130,246,0.1)',
                    border:
                      '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  💼 LinkedIn
                </a>
              )}

              {candidate.portfolio && (
                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 16px',
                    background:
                      'rgba(168,85,247,0.1)',
                    border:
                      '1px solid rgba(168,85,247,0.2)',
                    borderRadius: '8px',
                    color: '#a855f7',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  🌐 Portfolio
                </a>
              )}
            </div>
          </div>
        )}

        {/* ================= CONTACT ================= */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            padding: '28px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#f1f5f9',
              marginBottom: '16px',
            }}
          >
            Contact
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #334155',
              gap: '20px',
            }}
          >
            <span
              style={{
                color: '#475569',
                fontSize: '13px',
              }}
            >
              Email
            </span>

            <span
              style={{
                color: '#94a3b8',
                fontSize: '13px',
                wordBreak: 'break-word',
              }}
            >
              {candidate.email}
            </span>
          </div>

          {candidate.location && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                gap: '20px',
              }}
            >
              <span
                style={{
                  color: '#475569',
                  fontSize: '13px',
                }}
              >
                Location
              </span>

              <span
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              >
                {candidate.location}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= EMAIL MODAL ================= */}
      {showEmailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >

            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                gap: '15px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#f1f5f9',
                }}
              >
                Send Email to {candidate.name}
              </h2>

              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '22px',
                }}
              >
                ×
              </button>
            </div>

            {/* Email Type */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '10px',
                }}
              >
                Email Type
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                }}
              >
                {[
                  {
                    value: 'interview',
                    label: '📅 Interview',
                    color: '#3b82f6',
                  },
                  {
                    value: 'offer',
                    label: '🎉 Job Offer',
                    color: '#22c55e',
                  },
                  {
                    value: 'rejection',
                    label: '❌ Rejection',
                    color: '#ef4444',
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setEmailType(type.value)
                    }
                    style={{
                      padding: '10px',
                      background:
                        emailType === type.value
                          ? `${type.color}20`
                          : '#0f172a',
                      border:
                        emailType === type.value
                          ? `1px solid ${type.color}`
                          : '1px solid #334155',
                      borderRadius: '8px',
                      color:
                        emailType === type.value
                          ? type.color
                          : '#64748b',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Button */}
            <button
              onClick={generateAIEmail}
              disabled={aiLoading}
              style={{
                width: '100%',
                padding: '11px',
                background:
                  'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: aiLoading
                  ? 'not-allowed'
                  : 'pointer',
                opacity: aiLoading ? 0.7 : 1,
                fontFamily: 'Inter, sans-serif',
                marginBottom: '16px',
              }}
            >
              {aiLoading
                ? '✨ Generating...'
                : '✨ Generate AI Email'}
            </button>

            {/* Email Content */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '8px',
                }}
              >
                Email Content
              </label>

              <textarea
                value={emailContent}
                onChange={(e) =>
                  setEmailContent(e.target.value)
                }
                placeholder="Click 'Generate AI Email' or write your email here..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Modal Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                onClick={() =>
                  setShowEmailModal(false)
                }
                style={{
                  flex: 1,
                  padding: '13px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSendEmail}
                disabled={
                  sending || !emailContent.trim()
                }
                style={{
                  flex: 2,
                  padding: '13px',
                  background:
                    'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor:
                    sending || !emailContent.trim()
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    sending || !emailContent.trim()
                      ? 0.7
                      : 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {sending
                  ? 'Sending...'
                  : '📧 Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

