import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, password, role } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please fill all fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create user
    // role comes from frontend — 'seeker' or 'company'
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'seeker',
      authProvider: 'local',
    })

    // Generate token
    const token = generateToken(user._id)

    return NextResponse.json(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isPremium: user.isPremium || false,  // ← add this
        token: generateToken(user._id),
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}