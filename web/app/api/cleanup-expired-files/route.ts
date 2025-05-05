import { NextResponse } from 'next/server'
import { deleteFile } from '@/app/Database/firebase'
import db from '@/app/Database/Supabase/Base1'

export async function POST(request: Request) {
  try {
    // Get all temporary files from the database
    const { data: files, error } = await db
      .from('files')
      .select('*')
      .eq('isTemporary', true)

    if (error) {
      throw error
    }

    const now = new Date()
    const deletedFiles = []

    // Check each file and delete if expired
    for (const file of files) {
      const expiresAt = new Date(file.expiresAt)
      if (expiresAt < now) {
        try {
          // Delete from storage
          await deleteFile(file.path)
          
          // Delete from database
          await db
            .from('files')
            .delete()
            .eq('id', file.id)

          deletedFiles.push(file.id)
        } catch (error) {
          console.error(`Failed to delete file ${file.id}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedFiles.length,
      deletedFiles
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup expired files' },
      { status: 500 }
    )
  }
} 