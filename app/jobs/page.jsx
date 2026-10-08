'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import API from '@/lib/axios'

// Job card component
function JobCard({ job, userSkills = [] }) {
  // Calculate match score
  const matchScore = () => {
    if (!job.skills?.length || !userSkills?.length) return null

    const matched = job.skills.filter(skill =>
      userSkills.some(
        us =>
          us.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(us.toLowerCase())
      )
    )

    return Math.round((matched.length / job.skills.length) * 100)
  }

  const score = matchScore()

  const scoreColor =
    score >= 70
      ? '#22c55e'
      : score >= 40
        ? '#eab308'
        : '#ef4444'

  const scoreLabel =
    score >= 70
      ? 'Great match'
      : score >= 40
        ? 'Partial match'
        : 'Skill gap'

  const typeColors = {
    'full-time': 'bg-green-500/10 text-green-400 border-green-500/20',
    'part-time': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'remote': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'internship': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'contract': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not disclosed'

    if (salary.min && salary.max) {
      return `₹${(salary.min / 100000).toFixed(0)}L - ₹${(salary.max / 100000).toFixed(0)}L`
    }

    return `₹${((salary.min || salary.max) / 100000).toFixed(0)}L`
  }

  const timeAgo = (date) => {
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    )

    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`

    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <Link href={`/jobs/${job._id}`} className="no-underline block">
      <div className="bg-[#1e293b] border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:-translate-y-0.5 cursor-pointer group">

        {/* Company + Time */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                {job.companyName?.charAt(0)}
              </div>
            )}

            <div>
              <p className="text-slate-400 text-sm font-medium">
                {job.companyName}
              </p>

              <p className="text-slate-600 text-xs">
                {timeAgo(job.createdAt)}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              typeColors[job.jobType] || typeColors['full-time']
            }`}
          >
            {job.jobType}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
          {job.title}
        </h3>

        {/* Location + Experience */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-slate-500 text-sm flex items-center gap-1">
            📍 {job.location}
          </span>

          <span className="text-slate-500 text-sm flex items-center gap-1">
            💼 {job.experience}
          </span>
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg border border-slate-700"
              >
                {skill}
              </span>
            ))}

            {job.skills.length > 4 && (
              <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-500 rounded-lg border border-slate-700">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Match Score */}
        {score !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '12px 0',
              padding: '10px 14px',
              background: `${scoreColor}10`,
              borderRadius: '10px',
              border: `1px solid ${scoreColor}25`,
            }}
          >
            {/* Circular Score */}
            <div
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                flexShrink: 0,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                />

                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="4"
                  strokeDasharray={`${score * 0.879} 87.9`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>

              {/* Percentage text */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: scoreColor,
                    fontWeight: '800',
                    fontSize: '9px',
                  }}
                >
                  {score}%
                </span>
              </div>
            </div>

            {/* Score Information */}
            <div>
              <p
                style={{
                  color: scoreColor,
                  fontWeight: '700',
                  fontSize: '12px',
                }}
              >
                {scoreLabel}
              </p>

              <p
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                {
                  job.skills?.filter((skill) =>
                    userSkills.some(
                      (userSkill) =>
                        userSkill
                          .toLowerCase()
                          .includes(skill.toLowerCase()) ||
                        skill
                          .toLowerCase()
                          .includes(userSkill.toLowerCase())
                    )
                  ).length
                }
                /{job.skills?.length} skills matched
              </p>
            </div>
          </div>
        )}

        {/* Salary + Apply */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="text-blue-400 font-semibold text-sm">
            {formatSalary(job.salary)}
          </span>

          <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function JobsPage() {
  // Get logged-in user from Redux
  const { user } = useSelector((state) => state.auth)

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [jobType, setJobType] = useState('all')
  const [experience, setExperience] = useState('all')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)

    return () => clearTimeout(t)
  }, [search])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, jobType, experience, location])

  const fetchJobs = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await API.get('/jobs', {
        params: {
          search: debouncedSearch,
          jobType,
          experience,
          location,
          page,
          limit: 9,
        },
      })

      setJobs(data.jobs)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, jobType, experience, location, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const selectClass =
    'px-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-xl text-slate-300 text-sm outline-none focus:border-blue-500 transition-colors cursor-pointer'

  return (
    <div className="min-h-screen bg-[#0f172a]">

      {/* Header */}
      <div className="bg-[#1e293b] border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Browse Jobs
          </h1>

          <p className="text-slate-500">
            {loading ? 'Loading...' : `${total} jobs available`}
          </p>

          {/* Search Bar */}
          <div className="relative mt-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 sticky top-20">
              <h3 className="text-white font-bold mb-5">
                Filters
              </h3>

              <div className="space-y-5">

                {/* Job Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Job Type
                  </label>

                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className={selectClass + ' w-full'}
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Experience
                  </label>

                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={selectClass + ' w-full'}
                  >
                    <option value="all">All Levels</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-2 years">1-2 Years</option>
                    <option value="2-5 years">2-5 Years</option>
                    <option value="5+ years">5+ Years</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Clear Filters */}
                {(jobType !== 'all' || experience !== 'all' || location) && (
                  <button
                    onClick={() => {
                      setJobType('all')
                      setExperience('all')
                      setLocation('')
                    }}
                    className="w-full py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all cursor-pointer bg-transparent"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📭</p>

                <p className="text-xl font-bold text-white mb-2">
                  No jobs found
                </p>

                <p className="text-slate-500 text-sm">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      userSkills={user?.skills || []}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-400 rounded-xl text-sm font-semibold hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      ← Prev
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                          page === p
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:border-blue-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-400 rounded-xl text-sm font-semibold hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}