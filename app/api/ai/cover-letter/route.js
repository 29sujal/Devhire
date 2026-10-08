import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { jobTitle, companyName, skills, experience, userName } = await request.json()

    const prompt = `Write a professional cover letter for ${userName || 'a developer'} applying for ${jobTitle} at ${companyName || 'a company'}.
Required Skills: ${skills?.join(', ') || 'various technical skills'}
Experience Level: ${experience || 'fresher'}

Write a compelling 3-paragraph cover letter that:
1. Opens with enthusiasm for the role
2. Highlights relevant skills and value the applicant brings
3. Closes with a call to action

Keep it professional, genuine and under 250 words. Write in first person.`

    const coverLetter = await callGemini(prompt)

    if (!coverLetter) {
      return NextResponse.json({ message: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ coverLetter })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}