import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email })

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if Google OAuth user tries to login with password
    if (user.authProvider === 'google') {
      return NextResponse.json(
        { message: 'This account uses Google sign in. Please use Continue with Google.' },
        { status: 400 }
      )
    }

    const token = generateToken(user._id)

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isPremium: user.isPremium || false,  // ← add this
      token: generateToken(user._id),
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}