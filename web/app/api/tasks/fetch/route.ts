import { NextResponse } from "next/server";
import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import db from "@/app/Database/Supabase/Base1";

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch tasks with pagination
    const { data: tasks, error: tasksError, count } = await db
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.user_id)
      .order('dueDate', { ascending: true })
      .order('dueTime', { ascending: true })
      .range(offset, offset + limit - 1);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({
        error: 'Failed to fetch tasks',
        message: tasksError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? offset + limit < count : false
      }
    });

  } catch (error: any) {
    console.error('Error in fetch tasks endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 