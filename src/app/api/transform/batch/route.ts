import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface BatchRequest {
  questTitle?: string;
  subtasks: string[];
}

/**
 * API endpoint to transform a batch of subtasks
 */
export async function POST(req: NextRequest) {
  let requestBody: BatchRequest;
  
  try {
    requestBody = await req.json() as BatchRequest;
    
    if (!requestBody.subtasks || !Array.isArray(requestBody.subtasks) || requestBody.subtasks.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid field: subtasks' }, { status: 400 });
    }
    
    // Create a prompt that includes all subtasks
    const subtasksText = requestBody.subtasks.map((task: string, index: number) => `${index + 1}. ${task}`).join('\n');
    const prompt = `
      Transform these mundane subtasks into dark, atmospheric instructions.
      ${requestBody.questTitle ? `Main Quest: "${requestBody.questTitle}"` : ''}
      
      Subtasks:
      ${subtasksText}
      
      For each subtask, create a dark, atmospheric instruction that maintains the original meaning while adding a touch of mystery.
      Return a JSON object with an array of transformed subtasks in the same order:
      {
        "transformedSubtasks": [
          "First transformed subtask",
          "Second transformed subtask",
          ... and so on for each subtask
        ]
      }

      IMPORTANT: 
      1. Make sure to return exactly one transformed version for each input subtask, keeping the same order.
      2. Maintain the original meaning of each subtask while adding atmospheric elements.
      3. Each transformed subtask should be clear enough to understand what needs to be done.
      4. Provide ONLY valid JSON, no other text or explanations.
    `;
    
    // Call Claude to transform all subtasks at once
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: "Transform mundane subtasks into atmospheric instructions with a touch of mystery, while preserving the original meaning and intent. ALWAYS respond with VALID JSON ONLY, no other text or explanations.",
      messages: [{ role: "user", content: prompt }],
    });
    
    // Parse the response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error("Unexpected response format from Claude");
    }
    
    const contentText = contentBlock.text;
    // Improved JSON extraction
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("Failed to find JSON in the response:", contentText);
      throw new Error("Failed to parse JSON response from Claude");
    }
    
    const jsonStr = jsonMatch[0];
    
    try {
      const result = JSON.parse(jsonStr);
      
      if (!result.transformedSubtasks || !Array.isArray(result.transformedSubtasks)) {
        throw new Error("Invalid response format: missing transformedSubtasks array");
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError, "Original text:", jsonStr);
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Error batch transforming subtasks:', error);
    
    // If we have request body use it for fallback, otherwise empty array
    let subtasks: string[] = [];
    try {
      const body = await req.clone().json() as BatchRequest;
      subtasks = Array.isArray(body.subtasks) ? body.subtasks : [];
    } catch {
      // If we can't parse the request, use empty array
    }
    
    // Create a fallback response with generic transformed subtasks
    const fallbackResponse = {
      transformedSubtasks: subtasks.map((task: string) => 
        `The ancient covenant demands you ${task.toLowerCase()}, lest darkness consume all.`
      )
    };
    
    // Return the fallback with a success status to prevent client-side errors
    return NextResponse.json(fallbackResponse);
  }
} 