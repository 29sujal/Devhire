import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authenticate } from '@/lib/auth'

export async function PUT(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { name, title, bio, location, skills, experience, github, linkedin, portfolio } = await request.json()

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { name, title, bio, location, skills, experience, github, linkedin, portfolio },
      { new: true }
    ).select('-password')

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}