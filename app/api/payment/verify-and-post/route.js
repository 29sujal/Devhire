import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import Job from '@/models/Job'
import { authenticate } from '@/lib/auth'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      jobData,
    } = await request.json()

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Payment verified — create the job as active
    await connectDB()

    const job = await Job.create({
      ...jobData,
      company: auth.userId,
      status: 'active',
      isPaid: true,
      paymentId: razorpay_payment_id,
    })

    return NextResponse.json(
      { message: 'Job posted successfully', job },
      { status: 201 }
    )
  } catch (error) {
    console.error('Verify and post error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}