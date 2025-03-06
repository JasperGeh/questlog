import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client using API key from .env file (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Helper function to transform a single subtask
 */
export async function transformSubtask(subtask: string, questTitle?: string): Promise<string> {
  try {
    // Create a context-aware prompt that includes the main quest title if available
    const promptContent = questTitle 
      ? `Transform this subtask into a dark, atmospheric instruction.
         Main Quest: "${questTitle}"
         Subtask: "${subtask}"
         
         Create an instruction that maintains the original meaning while adding a touch of mystery and atmosphere.
         
         IMPORTANT: Your response must be the transformed instruction only, with no additional text or explanations.`
      : `Transform this subtask into a dark, atmospheric instruction: "${subtask}"
         
         Create an instruction that maintains the original meaning while adding a touch of mystery and atmosphere.
         
         IMPORTANT: Your response must be the transformed instruction only, with no additional text or explanations.`;
      
    // Make an API call to transform the subtask
    const subtaskResponse = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 150,
      system: "Transform mundane subtasks into atmospheric instructions with a touch of mystery, while preserving the original meaning and intent. Respond ONLY with the transformed instruction text - no additional explanations or context.",
      messages: [{ role: "user", content: promptContent }],
    });
    
    const subtaskContentBlock = subtaskResponse.content[0];
    if (subtaskContentBlock.type !== 'text') {
      throw new Error("Unexpected response format from Claude for subtask");
    }
    
    // Trim and clean up the response
    const transformedText = subtaskContentBlock.text.trim();
    
    // If empty response or too short, use fallback
    if (!transformedText || transformedText.length < 5) {
      return `The ancient scripts demand you ${subtask.toLowerCase()}.`;
    }
    
    return transformedText;
  } catch (error) {
    console.error("Error in transformSubtask:", error);
    // Return a fallback in case of error
    return `The ancient covenant demands you ${subtask.toLowerCase()}, lest darkness consume all.`;
  }
} 