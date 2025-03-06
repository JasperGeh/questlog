import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * API endpoint to transform a batch of subtasks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.subtasks || !Array.isArray(body.subtasks) || body.subtasks.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid field: subtasks' }, { status: 400 });
    }
    
    // Create a prompt that includes all subtasks
    const subtasksText = body.subtasks.map((task: string, index: number) => `${index + 1}. ${task}`).join('\n');
    const prompt = `
      Transform these mundane subtasks into dark, atmospheric instructions in the style of Dark Souls.
      ${body.questTitle ? `Main Quest: "${body.questTitle}"` : ''}
      
      Subtasks:
      ${subtasksText}
      
      For each subtask, create a dark, atmospheric instruction that maintains the original meaning while adding a touch of mystery, like in Dark Souls.
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
      2. Maintain the original meaning of each subtask while adding atmospheric elements, like in Dark Souls.
      3. Each transformed subtask should be clear enough to understand what needs to be done.
    `;
    
    // Call Claude to transform all subtasks at once
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: "Transform mundane subtasks into atmospheric instructions with a touch of mystery, like in Dark Souls, while preserving the original meaning and intent. Always respond with valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });
    
    // Parse the response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error("Unexpected response format from Claude");
    }
    
    const contentText = contentBlock.text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Claude");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    if (!result.transformedSubtasks || !Array.isArray(result.transformedSubtasks)) {
      throw new Error("Invalid response format: missing transformedSubtasks array");
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error batch transforming subtasks:', error);
    return NextResponse.json(
      { error: `Failed to transform subtasks: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 