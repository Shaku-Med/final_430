import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import { cookies, headers } from 'next/headers'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import { VerifyHeaders } from '@/app/account/Actions/SetQuickToken'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { decrypt } from '@/app/Auth/Lock/Enc'

interface AuthUser {
  user_id: string;
}

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    // Get headers and cookies
    const h = await headers()
    const c = await cookies()
    const au = h.get('user-agent')?.split(/\s+/).join('')
    const clientIP = await getClientIP(h)
    const header_v = await VerifyHeaders()

    // Set up verification keys
    const ky: string[] = [`${au}`, `${clientIP}`]
    let k: string[] = [`${process.env.PASS1}`, `${process.env.TOKEN2}`]

    // Verify headers
    if (!header_v) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid request headers'
      }, { status: 401 })
    }

    // Get authentication tokens
    const session = request.headers.get('Authorization')
    const task_token = c?.get('task_token')?.value

    if (!session || !task_token) {
      c.delete('task_token')
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please log in to create tasks'
      }, { status: 401 })
    }

    // Verify tokens
    const vrToken = await VerifyToken(`${session}`, k)
    const vrTaskToken = await VerifyToken(`${task_token}`, ky)

    if (!vrToken || !vrTaskToken) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    let {
      title,
      privacy,
      dueDate,
      dueTime,
      priority,
      attachments,
      tags,
      assignee,
      description,
      notifications
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Title is required'
      }, { status: 400 })
    }

    if(attachments && attachments.length > 0){
      console.log(attachments)
      // attachments = decrypt(`${attachments[0]}`, `${process.env.FILE_TOKEN}`)
    }
    // Create task in database
    const { data, error } = await db
      .from('tasks')
      .insert({
        user_id: user?.user_id,
        title,
        privacy: privacy || 'private',
        dueDate,
        dueTime,
        priority: priority || 'medium',
        attachments: attachments || [],
        tags: tags || [],
        assignee: assignee || null,
        description: description || '',
        notifications: notifications || [],
        created_at: new Date().toISOString(),
        task_id: crypto.randomUUID()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({
        error: 'Failed to create task',
        message: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      task: data
    })

  } catch (error: any) {
    console.error('Error in create task endpoint:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 })
  }
} 