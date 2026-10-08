import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { candidateName, companyName, emailType, jobTitle, skills } = await request.json()

    const prompts = {
      interview: `Write a professional interview invitation email to ${candidateName} from ${companyName}.
Position: ${jobTitle}
Skills: ${skills?.join(', ') || 'various'}
Include: specific interview date placeholder [DATE] and time [TIME], video/in-person option, what to prepare.
Tone: Professional but warm. Under 200 words.`,

      offer: `Write a professional job offer email to ${candidateName} from ${companyName}.
Position: ${jobTitle}
Include: congratulations, joining date placeholder [DATE], next steps to confirm acceptance.
Tone: Enthusiastic and welcoming. Under 200 words.`,

      rejection: `Write a kind professional rejection email to ${candidateName} from ${companyName}.
Position: ${jobTitle}
Include: thank them sincerely, encourage future applications, wish them well.
Tone: Empathetic and respectful. Do NOT mention reasons. Under 150 words.`,
    }

    const email = await callGemini(prompts[emailType] || prompts.interview)

    if (!email) {
      return NextResponse.json({ message: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ email })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}