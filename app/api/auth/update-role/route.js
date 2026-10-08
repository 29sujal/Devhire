import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authenticate } from '@/lib/auth'

export async function PATCH(request) {
  try {
    await connectDB()

    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { role } = await request.json()

    if (!['seeker', 'company'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { role },
      { new: true }
    ).select('-password')

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}