import { adminStorage } from './admin'

export const uploadFile = async (file: File, path: string) => {
  const bucket = adminStorage.bucket()
  const buffer = Buffer.from(await file.arrayBuffer())
  
  const fileRef = bucket.file(path)
  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  })

  const [url] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  })

  return url
}

export const deleteFile = async (path: string) => {
  const bucket = adminStorage.bucket()
  const fileRef = bucket.file(path)
  await fileRef.delete()
}

export const getFileUrl = async (path: string) => {
  const bucket = adminStorage.bucket()
  const fileRef = bucket.file(path)
  const [url] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  })
  return url
}

export const moveFile = async (sourcePath: string, destinationPath: string) => {
  const bucket = adminStorage.bucket()
  const sourceFile = bucket.file(sourcePath)
  const destinationFile = bucket.file(destinationPath)
  
  await sourceFile.copy(destinationFile)
  await sourceFile.delete()
  
  const [url] = await destinationFile.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  })
  
  return url
}

export const cleanupTempFiles = async (tempPaths: string[]) => {
  const bucket = adminStorage.bucket()
  await Promise.all(
    tempPaths.map(async (path) => {
      const file = bucket.file(path)
      await file.delete()
    })
  )
} 