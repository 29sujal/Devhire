import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { jobTitle, experience, skills, location, companySize, currentSalary } = await request.json()

    const prompt = `You are a salary expert for the Indian tech job market in 2026.

Role: ${jobTitle}
Experience: ${experience}
Skills: ${skills}
Location: ${location}, India
Company size: ${companySize}
Current salary: ${currentSalary || 'fresher/not disclosed'}

Give realistic 2026 Indian market salary data. Return JSON only:
{
  "minSalary": "₹3.5L",
  "maxSalary": "₹6L",
  "floorSalary": "₹3L",
  "targetSalary": "₹5.5L",
  "script": "Based on my skills in React and Node.js and the market research I've done, I'm looking for a compensation in the range of ₹5-6L. I'm open to discussing based on the complete package.",
  "tips": [
    "Never give a number first — always ask for their budget range",
    "Research Glassdoor and AmbitionBox before the interview",
    "Factor in equity, health insurance and learning budget in your total comp"
  ],
  "highValueSkills": ["TypeScript", "AWS", "Docker", "System Design"]
}`

    const raw = await callGemini(prompt)

    if (!raw) {
      return NextResponse.json(getFallbackSalary(jobTitle, experience, location))
    }

    let result
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
    } catch {
      result = getFallbackSalary(jobTitle, experience, location)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(getFallbackSalary('Developer', 'fresher', 'India'))
  }
}

function getFallbackSalary(jobTitle, experience, location) {
  const ranges = {
    'fresher':   { min: '₹2.5L', max: '₹4.5L', floor: '₹2L',   target: '₹4L'   },
    '1-2 years': { min: '₹4L',   max: '₹7L',   floor: '₹3.5L', target: '₹6.5L' },
    '2-5 years': { min: '₹7L',   max: '₹14L',  floor: '₹6L',   target: '₹12L'  },
    '5+ years':  { min: '₹15L',  max: '₹30L',  floor: '₹14L',  target: '₹25L'  },
  }
  const r = ranges[experience] || ranges['fresher']
  return {
    minSalary: r.min,
    maxSalary: r.max,
    floorSalary: r.floor,
    targetSalary: r.target,
    script: `Based on my research of the ${jobTitle} market in ${location} and my experience level, I'm looking for a package in the range of ${r.min} to ${r.max}. I'm open to discussing the complete compensation package including benefits.`,
    tips: [
      'Never be the first to give a number — ask what budget they have in mind',
      'Research AmbitionBox and Glassdoor for company-specific salary data',
      'Consider the full package: base, bonus, equity, health insurance, and WFH policy',
      'If they give you an offer, always ask for 24 hours to consider it',
    ],
    highValueSkills: ['TypeScript', 'AWS', 'Docker', 'System Design', 'Redis'],
  }
}