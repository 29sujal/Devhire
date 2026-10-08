import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Application from '@/models/Application'
import { authenticate } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const candidate = await User.findOne({ _id: params.id, role: 'seeker' })
      .select('name email avatar title skills location bio experience github linkedin portfolio resumeUrl isPremium')
      .lean()

    if (!candidate) {
      return NextResponse.json({ message: 'Candidate not found' }, { status: 404 })
    }

    // Get their application details for this company's jobs
    const application = await Application.findOne({
      applicant: params.id,
      company: auth.userId,
    }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ candidate, application })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}