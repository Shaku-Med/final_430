import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import { cookies } from 'next/headers'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'

export async function POST(request: Request) {
  try {
    // Get authentication token
    const c = await cookies()
    const _athK_ = c?.get('_athk_')?.value
    const authSession = c?.get('authsession')?.value

    if (!_athK_ || !authSession) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please log in to create tasks'
      }, { status: 401 })
    }

    // Verify authentication
    const vrToken = await VerifyToken(`${_athK_}`)
    if (!vrToken) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid authentication'
      }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const {
      user_id,
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
    if (!user_id || !title) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'User ID and title are required'
      }, { status: 400 })
    }

    // Create task in database
    const { data, error } = await db
      .from('tasks')
      .insert({
        user_id,
        title,
        privacy: privacy || 'private',
        dueDate,
        dueTime,
        priority: priority || 'medium',
        attachments: attachments || [],
        tags: tags || [],
        assignee: assignee || null,
        description: description || '',
        notifications: notifications || []
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