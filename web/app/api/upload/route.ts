import { uploadFile } from '@/app/Database/firebase'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create a temporary path with timestamp and UUID
    const timestamp = new Date().toISOString()
    const tempPath = `temp/${timestamp}/${uuidv4()}/${file.name}`
    
    // Upload the file
    const url = await uploadFile(file, tempPath)

    return NextResponse.json({ 
      url,
      path: tempPath,
      name: file.name,
      type: file.type,
      size: file.size,
      isTemporary: true,
      uploadedAt: timestamp,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 