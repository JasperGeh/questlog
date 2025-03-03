import { NextRequest, NextResponse } from 'next/server';
import { transformToEpicQuest, TransformRequest } from '@/app/services/epicTransformer';
import { Quest, QuestCategory, SubTask } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';

// This is a mock database for the API
// In a real app, you would use a database or connect to the same local storage
// This is simplified for demonstration
const quests: Quest[] = [];

export async function GET() {
  return NextResponse.json(quests);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Quest title is required' },
        { status: 400 }
      );
    }
    
    // Transform the todo into an epic quest
    const transformRequest: TransformRequest = {
      title: body.title,
      reward: body.reward || 'completion of this dark task'
    };
    
    const epicQuest = await transformToEpicQuest(transformRequest);
    
    // Create and transform subtasks if provided
    const subTasks: SubTask[] = Array.isArray(body.subTasks) 
      ? body.subTasks.map((task: string) => ({
          id: uuidv4(),
          description: epicQuest.subtaskTransformer(task),
          completed: false
        }))
      : [];
    
    // Create a new quest
    const quest: Quest = {
      id: uuidv4(),
      title: epicQuest.epicTitle,
      originalTitle: body.title,
      description: body.title, // Original title is now description
      epicDescription: epicQuest.epicDescription,
      category: (body.category && Object.values(QuestCategory).includes(body.category))
        ? body.category as QuestCategory
        : QuestCategory.MAIN,
      completed: false,
      createdAt: Date.now(),
      dueDate: body.dueDate ? new Date(body.dueDate).getTime() : undefined,
      subTasks,
      realLifeReward: body.reward || 'Task completion',
      visualReward: epicQuest.epicReward
    };
    
    // Add to our mock database
    quests.push(quest);
    
    return NextResponse.json({
      success: true,
      message: 'Quest added successfully',
      quest
    });
  } catch (error) {
    console.error('Error in quest API route:', error);
    return NextResponse.json(
      { error: 'Failed to create quest' },
      { status: 500 }
    );
  }
} 