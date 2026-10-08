'use client'

import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import API from '@/lib/axios'
import toast from 'react-hot-toast'

export default function SeekerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, applied: 0, shortlisted: 0, rejected: 0 })

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'seeker') { router.push('/dashboard/company'); return }
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    try {
      const { data } = await API.get('/applications/my')
      setApplications(data.applications)
      setStats({
        total: data.applications.length,
        applied: data.applications.filter(a => a.status === 'applied').length,
        shortlisted: data.applications.filter(a => a.status === 'shortlisted').length,
        rejected: data.applications.filter(a => a.status === 'rejected').length,
      })
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    applied: { label: 'Applied', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
    viewed: { label: '👀 Viewed', color: '#fbbf24', bg: 'rgba(234,179,8,0.15)' },
    shortlisted: { label: '⭐ Shortlisted', color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
    rejected: { label: '❌ Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
    hired: { label: '🎉 Hired!', color: '#c084fc', bg: 'rgba(168,85,247,0.15)' },
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            Welcome back, {user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500">Track your job applications and manage your profile</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: stats.total, icon: '📋', color: 'border-blue-500/20 from-blue-500/10' },
            { label: 'Pending', value: stats.applied, icon: '⏳', color: 'border-yellow-500/20 from-yellow-500/10' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: '⭐', color: 'border-green-500/20 from-green-500/10' },
            { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'border-red-500/20 from-red-500/10' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} to-transparent border ${s.color.split(' ')[0]} rounded-2xl p-5`}>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-3xl font-black text-white mt-2">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">My Applications</h2>
                <Link href="/jobs" className="text-blue-400 text-sm hover:underline no-underline">Browse more jobs →</Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                  <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                  Loading...
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-white font-semibold mb-1">No applications yet</p>
                  <p className="text-slate-500 text-sm mb-4">Start applying to jobs to track them here</p>
                  <Link href="/jobs" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl no-underline hover:bg-blue-700 transition-colors">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f172a', rounded: '12px', border: '1px solid #334155', borderRadius: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px' }}>
                          {app.job?.companyName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px' }}>{app.job?.title}</p>
                          <p style={{ color: '#475569', fontSize: '12px' }}>{app.job?.companyName} • {app.job?.location}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {app.job?._id && (
                          <a href={`/ai/interview-prep?jobId=${app.job._id}`} style={{ padding: '5px 10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '6px', color: '#a855f7', fontSize: '11px', fontWeight: '600', textDecoration: 'none' }}>
                            🎯 Prep
                          </a>
                        )}
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', background: statusConfig[app.status]?.bg, color: statusConfig[app.status]?.color }}>
                          {statusConfig[app.status]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile Card + Quick Actions */}
          <div className="space-y-5">

            {/* Profile Card */}
            <div style={{ background: '#1e293b', border: `1px solid ${user.isPremium ? 'rgba(234,179,8,0.3)' : '#334155'}`, borderRadius: '20px', padding: '24px', textAlign: 'center' }}>

              {/* Premium badge */}
              {user.isPremium && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '999px', color: '#eab308', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
                  ⭐ PREMIUM MEMBER
                </div>
              )}

              {/* Avatar */}
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: user.isPremium ? '3px solid #eab308' : '2px solid #334155' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 auto 12px' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{user.name}</p>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>{user.email}</p>

              <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '999px', color: '#3b82f6', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
                Job Seeker
              </span>

              {/* Premium benefits shown */}
              {user.isPremium && (
                <div style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)', borderRadius: '10px', padding: '12px', marginBottom: '16px', textAlign: 'left' }}>
                  <p style={{ color: '#eab308', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Your Premium Benefits:</p>
                  {['⭐ Featured profile badge active', '🔝 Priority in search results', '🤖 AI Resume Analyzer', '📧 Direct company messages'].map((b) => (
                    <p key={b} style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{b}</p>
                  ))}
                </div>
              )}

              <a href="/profile" style={{ display: 'block', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>
                Edit Profile
              </a>

              {!user.isPremium && (
                <a href="/premium" style={{ display: 'block', padding: '10px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '10px', color: '#eab308', fontSize: '13px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', marginTop: '8px' }}>
                  ⭐ Upgrade to Premium
                </a>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: '🔍 Browse Jobs', href: '/jobs', desc: 'Find your next role' },
                  { label: '🤖 AI Resume Check', href: '/ai/resume', desc: 'Get AI feedback on your resume' },
                  { label: '💰 Salary Negotiation AI', href: '/ai/salary', desc: 'Know what to ask for' },
                  { label: '📝 Update Profile', href: '/profile', desc: 'Add skills, bio & links' },
                  { label: '⭐ Premium Plan', href: '/premium', desc: 'Get featured to companies' },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center justify-between p-3 bg-[#0f172a] hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all no-underline group">
                    <div>
                      <p className="text-white text-sm font-medium">{action.label}</p>
                      <p className="text-slate-600 text-xs">{action.desc}</p>
                    </div>
                    <span className="text-slate-600 group-hover:text-slate-400 text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}