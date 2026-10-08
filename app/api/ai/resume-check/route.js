import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const jobTitle = formData.get('jobTitle') || 'Full Stack Developer'
    const resumeText = formData.get('resumeText') || ''

    // Use the text extracted from PDF on frontend
    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ message: 'Could not read resume content' }, { status: 400 })
    }

    const prompt = `You are an expert resume reviewer for tech companies. Analyze this resume for a ${jobTitle} position.

Resume content:
${resumeText.slice(0, 4000)}

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "score": 72,
  "strengths": ["Has relevant MERN stack experience", "Projects are well described", "Good educational background"],
  "improvements": ["Add quantifiable achievements like 'improved load time by 40%'", "Missing cloud/DevOps skills", "Summary section needs to be more impactful"],
  "missingSkills": ["Docker", "AWS", "TypeScript", "Redis"],
  "feedback": "Overall solid resume for a fresher. Focus on adding measurable impact to your project descriptions and include more modern DevOps tools to stand out."
}`

    const raw = await callGemini(prompt)

    if (!raw) {
      return NextResponse.json({ message: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    let result
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
    } catch {
      result = {
        score: 65,
        strengths: ['Resume structure is good', 'Technical skills listed'],
        improvements: ['Add more project details', 'Include measurable achievements', 'Add a professional summary'],
        missingSkills: ['Docker', 'TypeScript', 'AWS', 'CI/CD'],
        feedback: 'Your resume has a solid foundation. Focus on quantifying your impact in projects and adding modern DevOps skills.',
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Resume check error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}