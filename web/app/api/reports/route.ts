import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, title, reason } = body

    if (!type || !title || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { error } = await db
      .from('reports')
      .insert({
        type,
        title,
        reason,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
} 