import { NextRequest, NextResponse } from 'next/server';
import { transformSubtask } from '../../../utils/transformUtils';

interface SubtaskRequest {
  subtask: string;
  questTitle?: string;
}

/**
 * API endpoint to transform a single subtask
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SubtaskRequest;
    
    if (!body.subtask) {
      return NextResponse.json({ error: 'Missing required field: subtask' }, { status: 400 });
    }
    
    try {
      // Use the utility function to transform the subtask
      const transformedSubtask = await transformSubtask(body.subtask, body.questTitle);
      
      return NextResponse.json({ 
        transformedSubtask: transformedSubtask
      });
    } catch (transformError) {
      console.error("Error in transform function:", transformError);
      throw transformError;
    }
    
  } catch (error) {
    console.error('Error transforming subtask:', error);
    
    // Try to get the original subtask if possible
    let subtask = 'unknown task';
    try {
      const body = await req.clone().json() as SubtaskRequest;
      if (body.subtask) {
        subtask = body.subtask;
      }
    } catch {
      // If we can't parse the request, use default
    }
    
    // Return a fallback transformation
    return NextResponse.json({ 
      transformedSubtask: `The ancient covenant demands you ${subtask.toLowerCase()}, lest darkness consume all.`
    });
  }
} 