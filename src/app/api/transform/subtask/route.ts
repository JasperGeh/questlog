import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * API endpoint to transform a single subtask
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.subtask) {
      return NextResponse.json({ error: 'Missing required field: subtask' }, { status: 400 });
    }
    
    // Create the prompt for Anthropic's Claude 3.5 Haiku
    const promptContent = body.questTitle 
      ? `Transform this subtask into a dark, atmospheric instruction in the style of Dark Souls.
         Main Quest: "${body.questTitle}"
         Subtask: "${body.subtask}"
         
         Create an instruction that maintains the original meaning while adding a touch of mystery and atmosphere, like in Dark Souls.
         It should be clear enough to understand what needs to be done.`
      : `Transform this subtask into a dark, atmospheric instruction in the style of Dark Souls: "${body.subtask}"
         
         Create an instruction that maintains the original meaning while adding a touch of mystery and atmosphere, like in Dark Souls.
         It should be clear enough to understand what needs to be done.`;
    
    // Call Claude model
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 150,
      system: "Transform mundane subtasks into atmospheric instructions with a touch of mystery, like in Dark Souls, while preserving the original meaning and intent.",
      messages: [{ role: "user", content: promptContent }],
    });
    
    // Parse the response
    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error("Unexpected response format from Claude");
    }
    
    return NextResponse.json({ 
      transformedSubtask: contentBlock.text.trim() 
    });
    
  } catch (error) {
    console.error('Error transforming subtask:', error);
    return NextResponse.json(
      { error: `Failed to transform subtask: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 