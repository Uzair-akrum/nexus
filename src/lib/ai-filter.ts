import OpenAI from 'openai'
import { z } from 'zod'

// Schema for AI filter response
const FilterResponseSchema = z.object({
  proceed: z.boolean(),
  reasoning: z.string()
})

export type FilterResponse = z.infer<typeof FilterResponseSchema>

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Hardcoded few-shot prompt for filtering posts
const FEW_SHOT_PROMPT = `You are an AI filter that analyzes Reddit posts to determine if they should trigger an action. Your job is to evaluate posts based on the user's filter criteria and return a JSON response.

Examples:

User Filter: "Posts about people looking to purchase SaaS tools"
Post: "I'm looking for a good CRM system for my startup. Budget is around $100/month. Any recommendations?"
Response: {"proceed": true, "reasoning": "User is actively looking to purchase a SaaS tool (CRM) with a specific budget mentioned"}

User Filter: "Posts about people looking to purchase SaaS tools"
Post: "Just wanted to share my experience with Salesforce. It's been great for our team!"
Response: {"proceed": false, "reasoning": "User is sharing experience, not looking to purchase"}

User Filter: "Posts about hiring developers"
Post: "We're looking for a senior React developer to join our team. Remote work available."
Response: {"proceed": true, "reasoning": "Post is about hiring a developer position"}

User Filter: "Posts about hiring developers"
Post: "What's the best way to learn React? I'm a beginner"
Response: {"proceed": false, "reasoning": "User is asking about learning, not hiring"}

User Filter: "Posts about technical support issues"
Post: "My server keeps crashing and I can't figure out why. Error logs attached."
Response: {"proceed": true, "reasoning": "Clear technical support issue with server crashes"}

User Filter: "Posts about technical support issues"
Post: "Just deployed my new app! So excited to share it with everyone."
Response: {"proceed": false, "reasoning": "User is sharing success, not asking for technical support"}

Now analyze the following post based on the user's filter criteria:

User Filter: "{filterInstruction}"
Post: "{postContent}"

Response must be valid JSON with "proceed" (boolean) and "reasoning" (string) fields only.`

export async function filterPost(postContent: string, filterInstruction: string): Promise<FilterResponse | null> {
  try {
    const prompt = FEW_SHOT_PROMPT
      .replace('{filterInstruction}', filterInstruction)
      .replace('{postContent}', postContent)

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI filter that analyzes content and returns JSON responses. Always respond with valid JSON containing 'proceed' and 'reasoning' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('No content received from OpenAI')
      return null
    }

    // Parse the JSON response
    const jsonResponse = JSON.parse(content)

    // Validate with Zod schema
    const validatedResponse = FilterResponseSchema.parse(jsonResponse)

    return validatedResponse

  } catch (error) {
    console.error('Error in AI filter:', error)

    // If parsing fails, return null to skip the action
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors)
    } else if (error instanceof SyntaxError) {
      console.error('JSON parsing error:', error.message)
    }

    return null
  }
}

export async function testFilter(postContent: string, filterInstruction: string): Promise<FilterResponse | null> {
  // Same as filterPost but with additional logging for testing
  console.log('Testing filter with:')
  console.log('Filter instruction:', filterInstruction)
  console.log('Post content:', postContent)

  const result = await filterPost(postContent, filterInstruction)

  console.log('Filter result:', result)

  return result
} 