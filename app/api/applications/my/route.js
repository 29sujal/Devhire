import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/models/Application'
import { authenticate } from '@/lib/auth'

// GET /api/applications/my — seeker's own applications
export async function GET(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const applications = await Application.find({ applicant: auth.userId })
      .populate('job', 'title companyName location jobType')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ applications })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}