import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// TypeScript interfaces
interface TransformRequest {
  title: string;
  reward?: string;
}

// Initialize Anthropic client using API key from .env file (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Main endpoint to transform a todo into an epic quest
 */
export async function POST(req: NextRequest) {
  let requestBody: TransformRequest;
  
  try {
    requestBody = await req.json() as TransformRequest;
    
    if (!requestBody.title) {
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    }
    
    // Create the prompt for Anthropic's Claude 3.5 Haiku
    const prompt = `
      Transform this mundane task into a dark, mysterious quest description in the style of dark fantasy.
      Make it atmospheric while still clearly conveying the original meaning of the task.
      
      Task: ${requestBody.title}
      
      Return a JSON object with the following format:
      {
        "epicTitle": "A dark fantasy title for the quest that connects to the original task",
        "epicDescription": "A single sentence mysterious description that clearly relates to the original task while adding dark atmosphere",
        "epicReward": "An intangible real-world benefit from completing the task (like satisfaction, appreciation from others, peace of mind, etc.) described in a slightly mysterious way"
      }

      IMPORTANT: Your response must be a valid JSON object only, with no additional text.
    `;

    // Call Anthropic's Claude 3.5 Haiku model
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: "You are a master of dark fantasy language who transforms ordinary tasks into mysterious quests. Your descriptions should be atmospheric while clearly preserving the original meaning of tasks. Descriptions should be exactly one sentence. Rewards should be intangible real-world benefits (like satisfaction, relief, appreciation) written with a touch of mystery, never fantasy items. ALWAYS respond with VALID JSON ONLY, no other text or explanations.",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse the response content
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error("Unexpected response format from Claude");
    }
    
    const contentText = contentBlock.text;
    
    // Improved JSON extraction using regex to find JSON object
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Failed to find JSON in the response:", contentText);
      throw new Error("Failed to parse JSON response from Claude");
    }
    
    const jsonStr = jsonMatch[0];
    
    try {
      const result = JSON.parse(jsonStr);
      
      // Validate required fields
      if (!result.epicTitle || !result.epicDescription || !result.epicReward) {
        throw new Error("Missing required fields in the response");
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError, "Original text:", jsonStr);
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Error transforming quest:', error);
    
    // Try to get the original title if possible
    let title = 'Unknown Journey';
    try {
      const body = await req.clone().json() as TransformRequest;
      if (body.title) {
        title = body.title;
      }
    } catch {
      // If we can't parse the request, use default title
    }
    
    // Create a fallback response
    const fallbackResponse = {
      epicTitle: `The Quest of ${title}`,
      epicDescription: `A mysterious journey to ${title.toLowerCase()} awaits in the shadowed realm.`,
      epicReward: "The satisfaction of completing a task shrouded in importance."
    };
    
    // Return the fallback with a success status to prevent client-side errors
    return NextResponse.json(fallbackResponse);
  }
} 