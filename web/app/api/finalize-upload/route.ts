// I'm using node js now...
// import { moveFile } from '@/app/Database/firebase'
// import { NextResponse } from 'next/server'

import { redirect } from 'next/navigation'

// export async function POST(request: Request) {
//   try {
//     const { files, type, id } = await request.json()
    
//     if (!files || !files.length || !type || !id) {
//       return NextResponse.json(
//         { error: 'Missing required parameters' },
//         { status: 400 }
//       )
//     }

//     const results = await Promise.all(
//       files.map(async (file: { path: string, name: string }) => {
//         const permanentPath = `${type}/${id}/${file.name}`
//         const url = await moveFile(file.path, permanentPath)
//         return {
//           originalPath: file.path,
//           permanentPath,
//           url
//         }
//       })
//     )

//     return NextResponse.json({ results })
//   } catch (error) {
//     console.error('Finalization error:', error)
//     return NextResponse.json(
//       { error: 'Failed to finalize uploads' },
//       { status: 500 }
//     )
//   }
// } 

export async function POST(request: Request) {
  return redirect('/')
}

