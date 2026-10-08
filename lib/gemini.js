export async function callGemini(prompt, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      )

      const data = await response.json()

      if (data.error) {
        const isRateLimit = data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED'
        console.log(`Gemini attempt ${i + 1} error:`, data.error.message)

        if (isRateLimit && i < retries - 1) {
          // Wait longer between retries for rate limit errors
          await new Promise(r => setTimeout(r, 2000 * (i + 1)))
          continue
        }
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)))
          continue
        }
        return null
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        return null
      }

      return text
    } catch (error) {
      console.error(`Gemini attempt ${i + 1} failed:`, error)
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      return null
    }
  }
  return null
}