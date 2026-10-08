'use client'

import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import API from '@/lib/axios'
import toast from 'react-hot-toast'

export default function CompanyDashboard() {
  const { user } = useSelector((state) => state.auth)
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, activeJobs: 0 })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'company') { router.push('/dashboard/seeker'); return }
    fetchMyJobs()
  }, [user])

  const fetchMyJobs = async () => {
    try {
      const { data } = await API.get('/jobs/my')
      setJobs(data.jobs)
      setStats({
        totalJobs: data.jobs.length,
        activeJobs: data.jobs.filter(j => j.status === 'active').length,
        totalApplications: data.jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0),
      })
    } catch (err) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    closed: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  if (!user) return null
  // Add this before the main return
  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Company Dashboard</h1>
            <p className="text-slate-500">Manage your job listings and applications</p>
          </div>
          <Link href="/post-job" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors no-underline">
            + Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Jobs Posted', value: stats.totalJobs, icon: '💼', color: 'border-blue-500/20 from-blue-500/10' },
            { label: 'Active Listings', value: stats.activeJobs, icon: '✅', color: 'border-green-500/20 from-green-500/10' },
            { label: 'Total Applications', value: stats.totalApplications, icon: '📨', color: 'border-violet-500/20 from-violet-500/10' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} to-transparent border ${s.color.split(' ')[0]} rounded-2xl p-6 flex items-center gap-5`}>
              <span className="text-4xl">{s.icon}</span>
              <div>
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Job Listings */}
          <div className="lg:col-span-2">
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Your Job Listings</h2>
                <Link href="/post-job" className="text-blue-400 text-sm hover:underline no-underline">+ New Job</Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                  <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                  Loading...
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-white font-semibold mb-1">No jobs posted yet</p>
                  <p className="text-slate-500 text-sm mb-4">Post your first job to start receiving applications</p>
                  <Link href="/post-job" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl no-underline hover:bg-blue-700 transition-colors">
                    Post a Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job._id} className="p-4 bg-[#0f172a] rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{job.title}</p>
                          <p className="text-slate-500 text-sm mt-0.5">{job.location} • {job.jobType} • {job.applicationCount || 0} applications</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                          <Link href={`/jobs/${job._id}/applications`} className="text-xs text-blue-400 hover:underline no-underline font-medium">
                            View Apps →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Profile + Actions */}
          <div className="space-y-5">

            {/* Company Profile */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 text-center">
              {user.companyLogo ? (
                <img src={user.companyLogo} alt={user.companyName} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
                  {(user.companyName || user.name)?.charAt(0)}
                </div>
              )}
              <p className="text-white font-bold text-lg">{user.companyName || user.name}</p>
              <p className="text-slate-500 text-sm mb-4">{user.email}</p>
              <Link href="/company/profile" className="block w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-semibold rounded-xl no-underline transition-colors text-center">
                Edit Company Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: '📝 Post New Job', href: '/post-job', desc: 'Create a job listing' },
                  { label: '👥 Browse Candidates', href: '/candidates', desc: 'Find developers' },
                  { label: '📨 View Applications', href: `/jobs/${jobs[0]?._id}/applications`, desc: 'See who applied' },
                  { label: '🏢 Edit Company Profile', href: '/company/profile', desc: 'Update your details' },
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