import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { authenticate } from '@/lib/auth'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { amount } = await request.json()

    const order = await razorpay.orders.create({
      amount: amount || 49900, // ₹499 in paise
      currency: 'INR',
      receipt: `devhire_${Date.now()}`,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
  }
}