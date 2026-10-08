import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export async function POST(request) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { jobTitle, jobSkills, userSkills, experience } = await request.json()

    // Much simpler prompt — less tokens, faster response, fewer failures
    const prompt = `Generate 8 interview questions for a ${jobTitle} role.
Skills needed: ${jobSkills?.slice(0, 5).join(', ') || jobTitle}
Candidate experience: ${experience || 'fresher'}

Return JSON array only, no other text:
[
  {
    "question": "question text here",
    "category": "Technical",
    "difficulty": "Medium",
    "isLikelyAsked": true,
    "tip": "brief tip on how to answer",
    "sampleAnswer": "brief sample answer"
  }
]

Mix of: 3 Technical, 2 Behavioral, 1 HR, 1 Problem Solving, 1 System Design.
Difficulty: Easy, Medium, or Hard only.`

    const raw = await callGemini(prompt)

    if (!raw) {
      // Return fallback questions instead of error
      const fallback = getFallbackQuestions(jobTitle, jobSkills)
      return NextResponse.json({ questions: fallback })
    }

    let questions
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response')
      }
    } catch {
      const fallback = getFallbackQuestions(jobTitle, jobSkills)
      return NextResponse.json({ questions: fallback })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Interview prep error:', error)
    const fallback = getFallbackQuestions('Developer', [])
    return NextResponse.json({ questions: fallback })
  }
}

function getFallbackQuestions(jobTitle, skills) {
  const skillList = skills?.slice(0, 3).join(', ') || 'your tech stack'
  return [
    {
      question: `Tell me about yourself and your experience with ${skillList}.`,
      category: 'HR',
      difficulty: 'Easy',
      isLikelyAsked: true,
      tip: 'Keep it under 2 minutes. Focus on your skills and passion for this role.',
      sampleAnswer: `I'm a ${jobTitle} with hands-on experience in ${skillList}. I've built projects that helped me understand real-world development challenges, and I'm excited to bring that experience to your team.`
    },
    {
      question: `Walk me through a project you built using ${skills?.[0] || 'your primary technology'}.`,
      category: 'Technical',
      difficulty: 'Medium',
      isLikelyAsked: true,
      tip: 'Use STAR method: Situation, Task, Action, Result. Mention specific challenges you solved.',
      sampleAnswer: `I built a full-stack web application using ${skills?.[0] || 'React and Node.js'}. The main challenge was handling authentication securely. I implemented JWT tokens with refresh token rotation which improved security significantly.`
    },
    {
      question: 'How do you handle a situation where you disagree with your team lead technically?',
      category: 'Behavioral',
      difficulty: 'Medium',
      isLikelyAsked: true,
      tip: 'Show that you can communicate respectfully while standing by technical reasoning.',
      sampleAnswer: 'I would first make sure I fully understand their approach, then present my concerns with data or examples. I believe in respectful debate — if they still prefer their approach, I support the team decision while documenting my concerns.'
    },
    {
      question: `What is the difference between ${skills?.[0] || 'REST'} and alternative approaches you know?`,
      category: 'Technical',
      difficulty: 'Medium',
      isLikelyAsked: true,
      tip: 'Show depth of knowledge. Compare trade-offs, not just definitions.',
      sampleAnswer: 'REST is stateless and uses HTTP methods for CRUD operations, making it simple and widely supported. GraphQL gives clients control over what data they fetch, reducing over-fetching. I choose based on project needs — REST for simple APIs, GraphQL for complex data relationships.'
    },
    {
      question: 'How do you stay updated with new technologies?',
      category: 'HR',
      difficulty: 'Easy',
      isLikelyAsked: true,
      tip: 'Mention specific resources. Show genuine curiosity and learning habits.',
      sampleAnswer: 'I follow official documentation, build small projects with new tech, watch conference talks, and read newsletters. Recently I explored Next.js by rebuilding one of my projects with it — that hands-on approach works best for me.'
    },
    {
      question: 'Explain how you would optimize a slow API endpoint.',
      category: 'Problem Solving',
      difficulty: 'Hard',
      isLikelyAsked: true,
      tip: 'Start with profiling, then mention caching, database indexing, query optimization.',
      sampleAnswer: 'First I would profile the endpoint to find the bottleneck. Common causes are N+1 database queries, missing indexes, or large unoptimized queries. I would add database indexes, use select to fetch only needed fields, add Redis caching for frequent reads, and consider pagination.'
    },
    {
      question: 'Describe your approach to debugging a production issue.',
      category: 'Technical',
      difficulty: 'Hard',
      isLikelyAsked: false,
      tip: 'Show systematic thinking: reproduce, isolate, fix, verify, prevent.',
      sampleAnswer: 'I start by reproducing the issue in a safe environment. Then I check error logs and monitoring tools to narrow down the cause. I isolate the problem to a specific component or function, apply a fix, test thoroughly, and finally add monitoring or tests to prevent recurrence.'
    },
    {
      question: `Where do you see yourself in 2 years as a ${jobTitle}?`,
      category: 'Behavioral',
      difficulty: 'Easy',
      isLikelyAsked: true,
      tip: 'Align your goals with growth at this company. Show ambition but also stability.',
      sampleAnswer: `In 2 years, I want to have deepened my expertise in ${skills?.[0] || 'full-stack development'} and taken on more ownership of features end-to-end. I want to grow into a position where I mentor junior developers while staying technical.`
    }
  ]
}