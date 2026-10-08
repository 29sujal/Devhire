import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authenticate } from '@/lib/auth'

export async function GET(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const user = await User.findById(auth.userId)
      .select('-password')
      .lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isPremium: user.isPremium || false,
      title: user.title,
      skills: user.skills,
      location: user.location,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      portfolio: user.portfolio,
    })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}