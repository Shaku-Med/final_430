import { UploadedFile } from '../components/FileUploader'

export async function finalizeUploads(
  files: UploadedFile[],
  type: 'projects' | 'events',
  id: string
) {
  try {
    const response = await fetch('/api/finalize-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: files.map(file => ({
          path: file.path,
          name: file.file.name
        })),
        type,
        id
      })
    })

    if (!response.ok) {
      throw new Error('Failed to finalize uploads')
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error finalizing uploads:', error)
    throw error
  }
} 