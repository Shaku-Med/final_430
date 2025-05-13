import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userData = user
    const formData = await request.formData()

    // Extract form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const status = formData.get('status') as string
    const client = formData.get('client') as string
    const budget = formData.get('budget') as string
    const team = formData.get('team') as string

    // Validate required fields
    if (!title || !startDate || !endDate || !client) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Title, dates, and client are required'
      }, { status: 400 })
    }

    const projectData = {
      id: uuidv4(),
      title,
      description,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      status,
      client,
      budget,
      team,
      user_id: userData.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: project, error } = await db
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('[PROJECT_CREATE]', error)
      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to create project'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project
    })
  } catch (error) {
    console.error('[PROJECT_CREATE]', error)
    return NextResponse.json({
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 