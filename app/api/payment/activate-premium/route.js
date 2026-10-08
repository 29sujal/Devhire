import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authenticate } from '@/lib/auth'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 })
    }

    await connectDB()
    await User.findByIdAndUpdate(auth.userId, { isPremium: true })

    return NextResponse.json({ message: 'Premium activated successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}