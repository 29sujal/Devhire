import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/models/Application'
import Job from '@/models/Job'
import { authenticate } from '@/lib/auth'

// POST /api/applications — seeker applies to a job
export async function POST(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { jobId, coverLetter, resumeUrl } = await request.json()

    if (!jobId) {
      return NextResponse.json({ message: 'Job ID is required' }, { status: 400 })
    }

    // Find the job
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'active') {
      return NextResponse.json({ message: 'This job is no longer accepting applications' }, { status: 400 })
    }

    // Check if already applied
    const existing = await Application.findOne({
      job: jobId,
      applicant: auth.userId,
    })

    if (existing) {
      return NextResponse.json({ message: 'You have already applied for this job' }, { status: 400 })
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: auth.userId,
      company: job.company,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'applied',
    })

    // Increment application count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } })

    return NextResponse.json(
      { message: 'Application submitted successfully', application },
      { status: 201 }
    )
  } catch (error) {
    // Handle duplicate application (unique index)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      )
    }
    console.error('Application error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}