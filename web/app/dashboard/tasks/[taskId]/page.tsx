import React from 'react'
import TaskPage from './Component/Tasks'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: { taskId: string }
}

interface User {
  user_id: string;
  [key: string]: any;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const taskId: any = params?.taskId || null
    // Get task from database
    const { data: task } = await db
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    return {
      title: {
        absolute: task ? `${task.title} | Task Details` : 'Task Details'
      },
      description: task?.description || 'View and manage your task details',
      keywords: ['task management', 'project tasks', 'task details', 'workflow', 'productivity'],
      openGraph: {
        title: {
            absolute: task ? `${task.title} | Task Details` : 'Task Details'
        },
        description: task?.description || 'View and manage your task details',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: {
            absolute: task ? `${task.title} | Task Details` : 'Task Details'
        },
        description: task?.description || 'View and manage your task details',
      }
    }
  } catch {
    return {
      title: {
        absolute: 'Task Details'
      },
      description: 'View and manage your task details',
    }
  }
}

export default async function Page({ params }: Props) {
  const taskId = await params.taskId
  // Authenticate user
  const user = await IsAuth(true) as User
  if (!user || typeof user === 'boolean') {
    throw new Error('Unauthorized')
  }

  // Get task from database
  const { data: task, error } = await db
    .from('tasks')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user.user_id)
    .single()

  if (error || !task) {
    notFound()
  }

  return (
    <>
      <TaskPage T={task}/>
    </>
  )
}
