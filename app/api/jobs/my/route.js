import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Job from '@/models/Job'
import { authenticate } from '@/lib/auth'

// GET /api/jobs/my — company's own jobs
export async function GET(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const jobs = await Job.find({ company: auth.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ jobs })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}