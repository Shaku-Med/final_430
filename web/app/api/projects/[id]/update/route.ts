import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { decrypt } from '@/app/Auth/Lock/Enc'

interface AuthUser {
  user_id: string;
  email: string;
  id: string;
  firstname: string;
  name: string;
  lastname: string;
  joinedAt: string;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await IsAuth(true) as AuthUser
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const projectId = params.id
    if (!projectId) {
      return new NextResponse('Project ID is required', { status: 400 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const status = formData.get('status') as string
    const client = formData.get('client') as string
    const budget = formData.get('budget') as string
    const team = formData.get('team') as string

    if (!title || !description || !startDate || !endDate || !status || !client) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const { data: project, error: projectError } = await db
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return new NextResponse('Project not found', { status: 404 })
    }

    if (project.user_id !== auth.user_id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const updateData = {
      title,
      description,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      status,
      client,
      budget,
      team,
      updated_at: new Date().toISOString()
    }

    const { data: updatedProject, error: updateError } = await db
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('[PROJECT_UPDATE]', updateError)
      return new NextResponse('Internal error', { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    })
  } catch (error) {
    console.error('[PROJECT_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 