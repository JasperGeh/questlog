// This file provides client-side services to transform todos into epic quests
// It makes calls to server-side API endpoints to perform the transformations

export interface TransformRequest {
  title: string;
  reward?: string;
}

export interface TransformResponse {
  epicTitle: string;
  epicDescription: string;
  epicReward: string;
  subtaskTransformer: (subtask: string) => string;
}

export interface BatchSubtaskRequest {
  questTitle: string;
  subtasks: string[];
}

export interface BatchSubtaskResponse {
  transformedSubtasks: string[];
}

/**
 * Transforms an individual subtask into a dark fantasy style instruction using Claude AI.
 * Makes an API call to the server-side endpoint.
 */
export const transformSubtask = async (subtask: string, questTitle?: string): Promise<string> => {
  try {
    const response = await fetch('/api/transform/subtask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subtask,
        questTitle,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transform subtask');
    }

    const data = await response.json();
    return data.transformedSubtask;
  } catch (error) {
    console.error('Failed to transform subtask:', error);
    return `You must ${subtask.toLowerCase()}, as the ancient texts demand.`;
  }
};

/**
 * Transforms a batch of subtasks in one API call to reduce latency and API usage.
 * Makes an API call to the server-side endpoint.
 */
export const transformSubtasksBatch = async (request: BatchSubtaskRequest): Promise<BatchSubtaskResponse> => {
  try {
    const response = await fetch('/api/transform/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to batch transform subtasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to batch transform subtasks:', error);
    // Return simple fallback transformations
    return {
      transformedSubtasks: request.subtasks.map(subtask => 
        `The ancient covenant demands you ${subtask.toLowerCase()}, lest darkness consume all.`
      )
    };
  }
};

export const transformToEpicQuest = async (
  request: TransformRequest,
  subtasksToTransform?: string[]
): Promise<TransformResponse> => {
  try {
    // First, transform the main quest
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transform quest');
    }

    const result = await response.json();
    
    // Create a cache for transformed subtasks
    const subtaskCache = new Map<string, string>();
    
    // If subtasks were provided, transform them in batch
    if (subtasksToTransform && subtasksToTransform.length > 0) {
      const filteredSubtasks = subtasksToTransform.filter(task => task.trim());
      
      if (filteredSubtasks.length > 0) {
        try {
          // Batch transform the subtasks
          const batchResponse = await transformSubtasksBatch({
            questTitle: request.title,
            subtasks: filteredSubtasks,
          });
          
          // Cache the transformed subtasks
          filteredSubtasks.forEach((task, index) => {
            if (batchResponse.transformedSubtasks[index]) {
              subtaskCache.set(task, batchResponse.transformedSubtasks[index]);
            }
          });
        } catch (error) {
          console.error('Failed to batch transform subtasks:', error);
          // We'll use the fallback for any subtasks that weren't transformed
        }
      }
    }
    
    // Create a smart subtask transformer function
    const subtaskTransformer = (subtask: string): string => {
      // If we already transformed this subtask, return the cached result
      if (subtaskCache.has(subtask)) {
        return subtaskCache.get(subtask)!;
      }
      
      // Otherwise return a fallback
      return `The ancient covenant demands you ${subtask.toLowerCase()}, lest darkness consume all.`;
    };
    
    return {
      epicTitle: result.epicTitle,
      epicDescription: result.epicDescription,
      epicReward: result.epicReward,
      subtaskTransformer: subtaskTransformer
    };
    
  } catch (error) {
    console.error('Failed to transform quest using API:', error);
    throw new Error(`Failed to transform quest: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Example of production implementation with OpenAI:
/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const transformToEpicQuest = async (
  request: TransformRequest
): Promise<TransformResponse> => {
  const prompt = `
    Transform this mundane task into a dark, mysterious quest description in the style of Dark Souls.
    Make it ominous, cryptic, and atmospheric.
    
    Task: ${request.title}
    Real-life Reward: ${request.reward || ''}
    
    Please respond with a JSON object containing:
    - epicTitle: A dark fantasy title for the quest
    - epicDescription: A mysterious, ominous description in Dark Souls style
    - epicReward: A cryptic description of the reward
    - subtaskTransformer: A function to transform subtasks (represented as a description of how to transform them)
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are a master of dark fantasy language who transforms ordinary tasks into mysterious, cryptic quests in the style of Dark Souls." 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  try {
    const result = JSON.parse(response.choices[0].message.content);
    
    // Create a subtask transformer function based on the LLM's description
    const subtaskTransformer = (subtask: string): string => {
      // Make a follow-up call for each subtask
      // This is simplified - in production you might want to batch these
      const subtaskPrompt = `
        Transform this subtask into a dark, mysterious step in the style of Dark Souls:
        "${subtask}"
        
        Main Quest: ${request.title}
      `;
      
      // For demo purposes, just use a simple transformation
      return `The covenant requires you to ${subtask.toLowerCase()}, lest darkness consume all.`;
    };
    
    return {
      epicTitle: result.epicTitle,
      epicDescription: result.epicDescription,
      epicReward: result.epicReward,
      subtaskTransformer: subtaskTransformer
    };
  } catch (error) {
    console.error('Failed to parse LLM response', error);
    return {
      epicTitle: request.title,
      epicDescription: `The task of ${request.title.toLowerCase()} awaits, inevitable as the fading of light.`,
      epicReward: request.reward || "Completion of the dark ritual",
      subtaskTransformer: (subtask: string) => `You must ${subtask.toLowerCase()}, as it was foretold.`
    };
  }
};
*/ 