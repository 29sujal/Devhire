import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// Fix: use require for nodemailer in Next.js API routes
const nodemailer = require('nodemailer')

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { to, subject, body } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const sender = await User.findById(auth.userId).select('name email companyName')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"${sender.companyName || sender.name} via DevHire" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <span style="color: white; font-size: 22px; font-weight: 800;">DevHire</span>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="color: #334155; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${body}</div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
              Sent via DevHire on behalf of ${sender.companyName || sender.name}
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ message: error.message || 'Failed to send email' }, { status: 500 })
  }
}