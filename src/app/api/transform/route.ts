import { NextRequest, NextResponse } from 'next/server';
import { transformToEpicQuest, TransformRequest } from '@/app/services/epicTransformer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Todo title is required' },
        { status: 400 }
      );
    }
    
    const transformRequest: TransformRequest = {
      title: body.title,
      reward: body.reward
    };
    
    const result = await transformToEpicQuest(transformRequest);
    
    // Add a sample transformed subtask if any were provided
    const response = {
      ...result,
      sampleTransformedSubtask: body.sampleSubtask 
        ? result.subtaskTransformer(body.sampleSubtask) 
        : null
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in transform API route:', error);
    return NextResponse.json(
      { error: 'Failed to transform todo into quest' },
      { status: 500 }
    );
  }
} 