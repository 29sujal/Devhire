import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { title, experience, skills, jobType } = await request.json()

    if (!title) {
      return NextResponse.json({ message: 'Job title is required' }, { status: 400 })
    }

    const prompt = `Write a professional job description for a ${title} position.
Details:
- Job Type: ${jobType || 'full-time'}
- Experience Required: ${experience || 'fresher'}
- Key Skills: ${skills || 'to be determined'}

Write a compelling 3-4 paragraph job description that includes:
1. An engaging opening about the role
2. Key responsibilities (5-6 bullet points)
3. What we're looking for in a candidate
4. What we offer

Keep it professional and under 400 words. Do not use placeholders like [Company Name].`

    const description = await callGemini(prompt)

    if (!description) {
      return NextResponse.json({ message: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI job description error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}