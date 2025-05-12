import React from 'react'
import MyAchievements from './Component/MyAchievements'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

async function getAchievementData() {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return []
    }

    const userId = user.user_id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch tasks data
    const { data: tasks } = await db
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    // Fetch monthly tasks
    const { data: monthlyTasks } = await db
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    // Fetch events data
    const { data: events } = await db
      .from('events')
      .select('*')
      .eq('user_id', userId)

    // Fetch monthly events
    const { data: monthlyEvents } = await db
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    // Fetch projects data
    const { data: projects } = await db
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    // Fetch monthly projects
    const { data: monthlyProjects } = await db
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('joined_at', startOfMonth.toISOString())
      .lte('joined_at', endOfMonth.toISOString())

    // Calculate achievements based on the data
    const achievements = [
      {
        id: "1",
        title: "Task Master",
        description: "Complete 50 tasks successfully",
        progress: Math.min(((tasks?.length || 0) / 50) * 100, 100),
        icon: "Trophy",
        category: "Productivity",
        target: 50,
        current: tasks?.length || 0,
        dateEarned: (tasks?.length || 0) >= 50 ? new Date().toISOString() : undefined,
        monthlyProgress: Math.min(((monthlyTasks?.length || 0) / 20) * 100, 100),
        monthlyTarget: 20,
        monthlyCurrent: monthlyTasks?.length || 0
      },
      {
        id: "2",
        title: "Event Organizer",
        description: "Create and manage 10 events",
        progress: Math.min(((events?.length || 0) / 10) * 100, 100),
        icon: "Calendar",
        category: "Events",
        target: 10,
        current: events?.length || 0,
        dateEarned: (events?.length || 0) >= 10 ? new Date().toISOString() : undefined,
        monthlyProgress: Math.min(((monthlyEvents?.length || 0) / 5) * 100, 100),
        monthlyTarget: 5,
        monthlyCurrent: monthlyEvents?.length || 0
      },
      {
        id: "3",
        title: "Project Champion",
        description: "Successfully participate in 5 projects",
        progress: Math.min(((projects?.length || 0) / 5) * 100, 100),
        icon: "Rocket",
        category: "Projects",
        target: 5,
        current: projects?.length || 0,
        dateEarned: (projects?.length || 0) >= 5 ? new Date().toISOString() : undefined,
        monthlyProgress: Math.min(((monthlyProjects?.length || 0) / 3) * 100, 100),
        monthlyTarget: 3,
        monthlyCurrent: monthlyProjects?.length || 0
      },
      {
        id: "4",
        title: "Early Bird",
        description: "Complete 10 tasks before 9 AM",
        progress: Math.min(((tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0) / 10) * 100, 100),
        icon: "Sun",
        category: "Habits",
        target: 10,
        current: tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0,
        dateEarned: (tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0) >= 10 ? new Date().toISOString() : undefined,
        monthlyProgress: Math.min(((monthlyTasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0) / 5) * 100, 100),
        monthlyTarget: 5,
        monthlyCurrent: monthlyTasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0
      }
    ]

    return achievements
  } catch (error) {
    console.error('Error fetching achievement data:', error)
    return []
  }
}

const page = async () => {
  const achievements = await getAchievementData()
  
  return (
    <div>
      <MyAchievements achievements={achievements} />
    </div>
  )
}

export default page
