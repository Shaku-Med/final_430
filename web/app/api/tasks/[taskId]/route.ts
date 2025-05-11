import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import IsAuth from "@/app/Auth/IsAuth/IsAuth";
import VerifyHeaders from "@/app/Auth/IsAuth/SetToken";
import { getClientIP } from "@/app/Auth/IsAuth/SetToken";
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken";
import db from "@/app/Database/Supabase/Base1";

interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

interface TaskResponse {
  success: boolean;
  task: {
    task_id: string;
    title: string;
    description: string;
    status: "pending" | "completed";
    created_at: string;
    dueDate?: string;
    dueTime?: string;
    priority: "low" | "medium" | "high";
    privacy: string;
    tags: string[];
    assignee: string;
    attachments: Attachment[];
    notifications: Notification[];
  };
}

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get headers and cookies
    const h = await headers();
    const c = await cookies();
    const au = h.get('user-agent')?.split(/\s+/).join('');
    const clientIP = await getClientIP(h);
    const header_v = await VerifyHeaders();

    // Set up verification keys
    const ky: string[] = [`${au}`, `${clientIP}`];
    let k: string[] = [`${process.env.PASS1}`, `${process.env.TOKEN2}`];

    // Verify headers
    if (!header_v) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid request headers'
      }, { status: 401 });
    }

    // Get authentication tokens
    const session = request.headers.get('Authorization');
    const task_token = c?.get('task_token')?.value;

    if (!session || !task_token) {
      c.delete('task_token');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Please log in to view task details'
      }, { status: 401 });
    }

    // Verify tokens
    const vrToken = await VerifyToken(`${session}`, k);
    const vrTaskToken = await VerifyToken(`${task_token}`, ky);

    if (!vrToken || !vrTaskToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    // Fetch task from database with related data
    const { data: task, error } = await db
      .from('tasks')
      .select(`
        *,
        attachments:task_attachments(*),
        notifications:task_notifications(*)
      `)
      .eq('task_id', params.taskId)
      .eq('user_id', user.user_id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch task',
        message: error.message
      }, { status: 500 });
    }

    if (!task) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Task not found or you do not have permission to view it'
      }, { status: 404 });
    }

    // Format the response
    const response: TaskResponse = {
      success: true,
      task: {
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        status: task.status,
        created_at: task.created_at,
        dueDate: task.due_date,
        dueTime: task.due_time,
        priority: task.priority,
        privacy: task.privacy,
        tags: task.tags || [],
        assignee: task.assignee,
        attachments: task.attachments?.map((att: Attachment) => ({
          id: att.id,
          name: att.name,
          size: att.size,
          url: att.url,
          type: att.type
        })) || [],
        notifications: task.notifications?.map((notif: Notification) => ({
          id: notif.id,
          type: notif.type,
          message: notif.message,
          created_at: notif.created_at
        })) || []
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in fetch task endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete task from database
    const { error } = await db
      .from('tasks')
      .delete()
      .eq('task_id', params.taskId)
      .eq('user_id', user.user_id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete task',
        message: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in delete task endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await IsAuth(true);
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { title, description, dueDate, priority } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: 'Title is required'
      }, { status: 400 });
    }

    // Update task in database
    const { data, error } = await db
      .from('tasks')
      .update({
        title,
        description,
        dueDate,
        priority,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', params.taskId)
      .eq('user_id', user.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update task',
        message: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Task not found or you do not have permission to update it'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      task: data
    });

  } catch (error: any) {
    console.error('Error in update task endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 