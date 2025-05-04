import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import { cookies, headers } from 'next/headers'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import { GenerateId } from '@/app/Auth/Lock/Password'

export async function POST(request: Request) {
  try {
    const h = await headers()
    const c = await cookies()
    const au = h.get('user-agent')?.split(/\s+/).join('')
    const clientIP = await getClientIP(h)
    
    const user_id = c.get('c_usr')?.value
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, category, dueDate, status } = data

    if (!title || !description || !category || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = await GenerateId('projects', [
      {name: 'project_id', length: 15},
      {name: 'xs', length: 20},
    ], db)

    if (!id) {
      return NextResponse.json({ error: 'Failed to generate project ID' }, { status: 500 })
    }

    const { error } = await db.from('projects').insert({
      project_id: id.project_id,
      title,
      description,
      category,
      due_date: dueDate,
      status,
      created_by: user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team: [],
      tasks: [],
      progress: 0
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      project_id: id.project_id
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 