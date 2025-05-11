import { NextResponse } from "next/server";
import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import db from "@/app/Database/Supabase/Base1";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    // Verify user authentication
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      console.error('Authentication failed:', { user });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'completed'].includes(status)) {
      console.error('Invalid status value:', { status });
      return NextResponse.json({
        error: 'Invalid status',
        message: 'Status must be either "pending" or "completed"'
      }, { status: 400 });
    }

    // First check if the task exists and belongs to the user
    const { data: existingTask, error: checkError } = await db
      .from('tasks')
      .select('task_id, status')
      .eq('task_id', params.taskId)
      .eq('user_id', user.user_id)
      .single();

    if (checkError) {
      console.error('Error checking task:', checkError);
      return NextResponse.json({
        error: 'Failed to verify task',
        message: checkError.message
      }, { status: 500 });
    }

    if (!existingTask) {
      console.error('Task not found or unauthorized:', { taskId: params.taskId, userId: user.user_id });
      return NextResponse.json({
        error: 'Not found',
        message: 'Task not found or you do not have permission to update it'
      }, { status: 404 });
    }

    // Update task status
    const { data, error } = await db
      .from('tasks')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', params.taskId)
      .eq('user_id', user.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task status:', error);
      return NextResponse.json({
        error: 'Failed to update task status',
        message: error.message
      }, { status: 500 });
    }

    if (!data) {
      console.error('No data returned after update:', { taskId: params.taskId });
      return NextResponse.json({
        error: 'Update failed',
        message: 'Task update completed but no data was returned'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task status updated successfully',
      task: data
    });

  } catch (error: any) {
    console.error('Error in update task status endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 