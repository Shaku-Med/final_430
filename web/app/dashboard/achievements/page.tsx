import React from 'react'
import AchievementsPage from './Component/Achievements'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

async function getAchievementData() {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return []
    }

    const userId = user.user_id

    // Fetch tasks data
    const { data: tasks } = await db
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    // Fetch events data
    const { data: events } = await db
      .from('events')
      .select('*')
      .eq('user_id', userId)

    // Fetch projects data
    const { data: projects } = await db
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    // Calculate achievements based on the data
    const achievements = [
      {
        id: "1",
        title: "Task Master",
        description: "Complete 50 tasks successfully",
        totalEarned: tasks?.length || 0,
        totalUsers: 200, // This could be fetched from total users count
        icon: "Trophy",
        category: "Productivity"
      },
      {
        id: "2",
        title: "Event Organizer",
        description: "Create and manage 10 events",
        totalEarned: events?.length || 0,
        totalUsers: 200,
        icon: "Calendar",
        category: "Events"
      },
      {
        id: "3",
        title: "Project Champion",
        description: "Successfully participate in 5 projects",
        totalEarned: projects?.length || 0,
        totalUsers: 200,
        icon: "Rocket",
        category: "Projects"
      },
      {
        id: "4",
        title: "Early Bird",
        description: "Complete 10 tasks before 9 AM",
        totalEarned: tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0,
        totalUsers: 200,
        icon: "Sun",
        category: "Habits"
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
    <>
      <AchievementsPage data={achievements}/>
    </>
  )
}

export default page
