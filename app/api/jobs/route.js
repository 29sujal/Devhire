import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Job from '@/models/Job'
import { authenticate } from '@/lib/auth'

// GET /api/jobs — public, anyone can browse
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const jobType = searchParams.get('jobType') || 'all'
    const experience = searchParams.get('experience') || 'all'
    const location = searchParams.get('location') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 9

    // Build query
    const query = { status: 'active', isPaid: true }

    if (jobType !== 'all') query.jobType = jobType
    if (experience !== 'all') query.experience = experience
    if (location) query.location = { $regex: location, $options: 'i' }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ]
    }

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    ])

    return NextResponse.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST /api/jobs — company only, protected
export async function POST(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, description, requirements, skills, location, jobType, salary, experience } = body

    if (!title || !description || !location) {
      return NextResponse.json({ message: 'Title, description and location are required' }, { status: 400 })
    }

    // Job starts as draft until paid
    const job = await Job.create({
      title,
      description,
      requirements: requirements || [],
      skills: skills || [],
      location,
      jobType: jobType || 'full-time',
      salary: salary || { min: 0, max: 0, currency: 'INR' },
      experience: experience || 'fresher',
      company: auth.userId,
      companyName: body.companyName || 'Company',
      companyLogo: body.companyLogo || '',
      status: 'draft',
      isPaid: false,
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}