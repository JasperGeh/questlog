import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// TypeScript interfaces
interface TransformRequest {
  title: string;
  reward?: string;
}

interface TransformResponse {
  epicTitle: string;
  epicDescription: string;
  epicReward: string;
}

interface SubtaskTransformRequest {
  subtask: string;
  questTitle?: string;
}

interface BatchSubtaskRequest {
  questTitle: string;
  subtasks: string[];
}

// Initialize Anthropic client using API key from .env file (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Main endpoint to transform a todo into an epic quest
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TransformRequest;
    
    if (!body.title) {
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    }
    
    // Create the prompt for Anthropic's Claude 3.5 Haiku
    const prompt = `
      Transform this mundane task into a dark, mysterious quest description in the style of Dark Souls.
      Make it ominous, cryptic, and atmospheric.
      
      Task: ${body.title}
      Real-life Reward: ${body.reward || 'completion of the task'}
      
      Return a JSON object with the following format:
      {
        "epicTitle": "A dark fantasy title for the quest",
        "epicDescription": "A mysterious, ominous description in Dark Souls style (at least 2-3 sentences)",
        "epicReward": "A cryptic description of the reward"
      }
    `;

    // Call Anthropic's Claude 3.5 Haiku model
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: "You are a master of dark fantasy language who transforms ordinary tasks into mysterious, cryptic quests in the style of Dark Souls. Always respond with valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse the response content
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
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error transforming quest:', error);
    return NextResponse.json(
      { error: `Failed to transform quest: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Helper function to transform a single subtask
 */
export async function transformSubtask(subtask: string, questTitle?: string): Promise<string> {
  // Create a context-aware prompt that includes the main quest title if available
  const promptContent = questTitle 
    ? `Transform this subtask into a dark, ominous instruction in the style of Dark Souls.
       Main Quest: "${questTitle}"
       Subtask: "${subtask}"`
    : `Transform this subtask into a dark, ominous instruction in the style of Dark Souls: "${subtask}"`;
    
  // Make an API call to transform the subtask
  const subtaskResponse = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 150,
    system: "Transform mundane subtasks into dark, cryptic descriptions in the style of Dark Souls.",
    messages: [{ role: "user", content: promptContent }],
  });
  
  const subtaskContentBlock = subtaskResponse.content[0];
  if (subtaskContentBlock.type !== 'text') {
    throw new Error("Unexpected response format from Claude for subtask");
  }
  
  return subtaskContentBlock.text.trim();
} 