import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/models/Application'
import Job from '@/models/Job'
import { authenticate } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const job = await Job.findOne({ _id: params.id, company: auth.userId })
    if (!job) {
      return NextResponse.json({ message: 'Job not found or unauthorized' }, { status: 404 })
    }

    const applications = await Application.find({ job: params.id })
      .populate('applicant', 'name email avatar title skills location bio github linkedin portfolio resumeUrl')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ applications, job })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}