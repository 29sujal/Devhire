'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import API from '@/lib/axios'

export default function CandidatesPage() {
    const { user } = useSelector((state) => state.auth)
    const router = useRouter()
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!user) { router.push('/login'); return }
        fetchCandidates()
    }, [user])

    const fetchCandidates = async () => {
        try {
            const { data } = await API.get('/candidates')
            setCandidates(data.candidates)
        } catch (err) {
            console.error('Failed to fetch candidates')
        } finally {
            setLoading(false)
        }
    }

    const filtered = candidates.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        c.title?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 16px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>Browse Candidates</h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Find talented developers for your team</p>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '28px' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, skills, title..."
                        style={{ width: '100%', padding: '13px 16px 13px 42px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading candidates...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155' }}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
                        <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>No candidates found</p>
                        <p style={{ color: '#64748b' }}>Try a different search term</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {filtered.map((candidate) => (
                            <div
                                key={candidate._id}
                                onClick={() => router.push(`/candidates/${candidate._id}`)}
                                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                    {candidate.avatar ? (
                                        <img src={candidate.avatar} alt={candidate.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px' }}>
                                            {candidate.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ color: '#f1f5f9', fontWeight: '700' }}>{candidate.name}</p>
                                        <p style={{ color: '#64748b', fontSize: '13px' }}>{candidate.title || 'Developer'}</p>
                                    </div>
                                </div>

                                {candidate.skills?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                        {candidate.skills.slice(0, 4).map(skill => (
                                            <span key={skill} style={{ padding: '3px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', fontSize: '11px' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {candidate.location && (
                                    <p style={{ color: '#475569', fontSize: '13px' }}>📍 {candidate.location}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}