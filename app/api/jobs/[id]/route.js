import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Job from '@/models/Job'
import Application from '@/models/Application'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const job = await Job.findById(params.id).lean()

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    // Check if current user already applied
    let hasApplied = false
    const token = getTokenFromRequest(request)
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const existing = await Application.findOne({
          job: params.id,
          applicant: decoded.id,
        })
        hasApplied = !!existing
      }
    }

    // Increment view count
    await Job.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json({ job, hasApplied })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}