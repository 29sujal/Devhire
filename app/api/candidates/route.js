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

    const candidates = await User.find({ role: 'seeker' })
      .select('name email avatar title skills location bio')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ candidates })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}