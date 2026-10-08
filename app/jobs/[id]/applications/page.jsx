'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import API from '@/lib/axios'

export default function JobApplicationsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)

  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'company') {
      router.push('/dashboard/seeker')
      return
    }

    fetchApplications()
  }, [user, id, router])

  const fetchApplications = async () => {
    try {
      const { data } = await API.get(`/applications/job/${id}`)

      setApplications(data.applications)
      setJob(data.job)
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId)

    try {
      await API.patch(`/applications/${appId}/status`, { status })

      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId
            ? { ...a, status }
            : a
        )
      )

      toast.success(`Status updated to ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
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

        Loading applications...

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
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/company')}
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
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#f1f5f9',
              marginBottom: '6px',
            }}
          >
            Applications
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            {job?.title} • {applications.length} total applications
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          {Object.entries(statusConfig).map(([key, val]) => (
            <div
              key={key}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: val.color,
                }}
              >
                {applications.filter(
                  (a) => a.status === key
                ).length}
              </p>

              <p
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                  marginTop: '4px',
                }}
              >
                {val.label}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              background: '#1e293b',
              borderRadius: '20px',
              border: '1px solid #334155',
            }}
          >
            <p
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📭
            </p>

            <p
              style={{
                color: '#f1f5f9',
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '8px',
              }}
            >
              No applications yet
            </p>

            <p
              style={{
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Applications will appear here when candidates apply
            </p>
          </div>
        ) : (

          /* Applications */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {applications.map((app) => {

              const currentStatus =
                statusConfig[app.status] || statusConfig.applied

              return (
                <div
                  key={app._id}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >

                  {/* Applicant Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >

                    {/* Applicant Info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background:
                            'linear-gradient(135deg, #2563eb, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {(app.applicant?.name || 'A')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p
                          style={{
                            color: '#f1f5f9',
                            fontWeight: '700',
                            fontSize: '16px',
                          }}
                        >
                          {app.applicant?.name || 'Applicant'}
                        </p>

                        <p
                          style={{
                            color: '#64748b',
                            fontSize: '13px',
                            marginTop: '2px',
                          }}
                        >
                          {app.applicant?.email}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: currentStatus.bg,
                          color: currentStatus.color,
                        }}
                      >
                        {currentStatus.label}
                      </span>

                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) =>
                          updateStatus(
                            app._id,
                            e.target.value
                          )
                        }
                        style={{
                          padding: '6px 12px',
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#94a3b8',
                          fontSize: '12px',
                          cursor: 'pointer',
                          outline: 'none',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <option value="applied">
                          Applied
                        </option>

                        <option value="viewed">
                          Viewed
                        </option>

                        <option value="shortlisted">
                          Shortlisted
                        </option>

                        <option value="rejected">
                          Rejected
                        </option>

                        <option value="hired">
                          Hired
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div
                      style={{
                        padding: '14px',
                        background: '#0f172a',
                        borderRadius: '10px',
                        border: '1px solid #334155',
                        marginBottom: '16px',
                      }}
                    >
                      <p
                        style={{
                          color: '#475569',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '8px',
                        }}
                      >
                        Cover Letter
                      </p>

                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: '13px',
                          lineHeight: '1.7',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >

                      {/* Profile */}
                      <a
                        href={`/candidates/${app.applicant?._id}`}
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
                        👤 View Full Profile & Details
                      </a>

                      {/* Resume */}
                      {app.resumeUrl && (
                        <a
                          href={`https://docs.google.com/viewer?url=${encodeURIComponent(app.resumeUrl)}`}
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
                          📄 View Resume
                        </a>
                      )}

                      {/* Portfolio */}
                      {app.applicantDetails?.portfolio && (
                        <a
                          href={app.applicantDetails.portfolio}
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
                          🔗 Portfolio
                        </a>
                      )}

                      {/* LinkedIn */}
                      {app.applicantDetails?.linkedin && (
                        <a
                          href={app.applicantDetails.linkedin}
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
                    </div>

                    {/* Applied Date */}
                    <p
                      style={{
                        color: '#334155',
                        fontSize: '11px',
                      }}
                    >
                      Applied{' '}
                      {new Date(
                        app.createdAt
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}