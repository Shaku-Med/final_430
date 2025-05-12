import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Trophy, Calendar, Rocket, Sun } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

interface Student {
  id: string
  name: string
  avatar?: string
  earnedDate: string
}

interface UserData {
  user_id: string;
  firstname: string;
  lastname: string;
  name: string;
  profile: string;
}

interface TaskRecord {
  user_id: string;
  users: UserData;
  created_at?: string;
}

type DatabaseRecord = {
  user_id: string;
  users: UserData;
  created_at?: string;
}

async function getAchievementData(id: string) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return null
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

    // Get total users count
    const { count: totalUsers } = await db
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Calculate achievement data based on ID
    const achievements = {
      "1": {
        id: "1",
        title: "Task Master",
        description: "Complete 50 tasks successfully",
        totalEarned: tasks?.length || 0,
        totalUsers: totalUsers || 200,
        category: "Productivity",
        icon: "Trophy",
        target: 50,
        current: tasks?.length || 0,
        progress: Math.min(((tasks?.length || 0) / 50) * 100, 100)
      },
      "2": {
        id: "2",
        title: "Event Organizer",
        description: "Create and manage 10 events",
        totalEarned: events?.length || 0,
        totalUsers: totalUsers || 200,
        category: "Events",
        icon: "Calendar",
        target: 10,
        current: events?.length || 0,
        progress: Math.min(((events?.length || 0) / 10) * 100, 100)
      },
      "3": {
        id: "3",
        title: "Project Champion",
        description: "Successfully participate in 5 projects",
        totalEarned: projects?.length || 0,
        totalUsers: totalUsers || 200,
        category: "Projects",
        icon: "Rocket",
        target: 5,
        current: projects?.length || 0,
        progress: Math.min(((projects?.length || 0) / 5) * 100, 100)
      },
      "4": {
        id: "4",
        title: "Early Bird",
        description: "Complete 10 tasks before 9 AM",
        totalEarned: tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0,
        totalUsers: totalUsers || 200,
        category: "Habits",
        icon: "Sun",
        target: 10,
        current: tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0,
        progress: Math.min(((tasks?.filter(task => {
          const taskDate = new Date(task.created_at)
          return taskDate.getHours() < 9
        }).length || 0) / 10) * 100, 100)
      }
    }

    return achievements[id as keyof typeof achievements]
  } catch (error) {
    console.error('Error fetching achievement data:', error)
    return null
  }
}

async function getStudentsForAchievement(achievementId: string) {
  try {
    switch (achievementId) {
      case "1": // Task Master
        const { data: taskUsers } = await db
          .from('tasks')
          .select('user_id, users!inner(user_id, firstname, lastname, name, profile)')
          .eq('status', 'completed');

        if (!taskUsers) return [];
        
        // Filter users who have completed 50 or more tasks
        const taskCounts = (taskUsers as unknown as DatabaseRecord[]).reduce((acc: { [key: string]: number }, curr) => {
          acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(taskCounts)
          .filter(([_, count]) => count >= 50)
          .map(([userId]) => {
            const user = (taskUsers as unknown as DatabaseRecord[]).find(t => t.user_id === userId)?.users;
            return {
              id: userId,
              name: user?.name || `${user?.firstname} ${user?.lastname}`,
              avatar: user?.profile,
              earnedDate: new Date().toISOString()
            };
          });

      case "2": // Event Organizer
        const { data: eventUsers } = await db
          .from('events')
          .select('user_id, users!inner(user_id, firstname, lastname, name, profile)');

        if (!eventUsers) return [];

        const eventCounts = (eventUsers as unknown as DatabaseRecord[]).reduce((acc: { [key: string]: number }, curr) => {
          acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(eventCounts)
          .filter(([_, count]) => count >= 10)
          .map(([userId]) => {
            const user = (eventUsers as unknown as DatabaseRecord[]).find(e => e.user_id === userId)?.users;
            return {
              id: userId,
              name: user?.name || `${user?.firstname} ${user?.lastname}`,
              avatar: user?.profile,
              earnedDate: new Date().toISOString()
            };
          });

      case "3": // Project Champion
        const { data: projectUsers } = await db
          .from('project_members')
          .select('user_id, users!inner(user_id, firstname, lastname, name, profile)')
          .eq('status', 'active');

        if (!projectUsers) return [];

        const projectCounts = (projectUsers as unknown as DatabaseRecord[]).reduce((acc: { [key: string]: number }, curr) => {
          acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(projectCounts)
          .filter(([_, count]) => count >= 5)
          .map(([userId]) => {
            const user = (projectUsers as unknown as DatabaseRecord[]).find(p => p.user_id === userId)?.users;
            return {
              id: userId,
              name: user?.name || `${user?.firstname} ${user?.lastname}`,
              avatar: user?.profile,
              earnedDate: new Date().toISOString()
            };
          });

      case "4": // Early Bird
        const { data: earlyBirdUsers } = await db
          .from('tasks')
          .select('user_id, users!inner(user_id, firstname, lastname, name, profile), created_at')
          .eq('status', 'completed');

        if (!earlyBirdUsers) return [];

        const earlyBirdCounts = (earlyBirdUsers as unknown as DatabaseRecord[]).reduce((acc: { [key: string]: number }, curr) => {
          const taskDate = new Date(curr.created_at!);
          if (taskDate.getHours() < 9) {
            acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
          }
          return acc;
        }, {});

        return Object.entries(earlyBirdCounts)
          .filter(([_, count]) => count >= 10)
          .map(([userId]) => {
            const user = (earlyBirdUsers as unknown as DatabaseRecord[]).find(t => t.user_id === userId)?.users;
            return {
              id: userId,
              name: user?.name || `${user?.firstname} ${user?.lastname}`,
              avatar: user?.profile,
              earnedDate: new Date().toISOString()
            };
          });

      default:
        return [];
    }
  } catch (error) {
    console.error('Error fetching students data:', error);
    return [];
  }
}

const iconMap: { [key: string]: React.ReactNode } = {
  Trophy: <Trophy className="w-6 h-6 text-yellow-500" />,
  Calendar: <Calendar className="w-6 h-6 text-red-500" />,
  Rocket: <Rocket className="w-6 h-6 text-orange-500" />,
  Sun: <Sun className="w-6 h-6 text-yellow-400" />
}

const page = async ({ params }: { params: { id: string } }) => {
  const achievement = await getAchievementData(params.id)
  const students = await getStudentsForAchievement(params.id)

  if (!achievement) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/achievements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Achievement Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/achievements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{achievement.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </div>
                {iconMap[achievement.icon]}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Category</span>
                  <span>{achievement.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievement.current} / {achievement.target}</span>
                </div>
                <Progress value={achievement.progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Total Earned</span>
                  <span>{achievement.totalEarned} students</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span>{Math.round((achievement.totalEarned / achievement.totalUsers) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Students Who Earned This</CardTitle>
              <CardDescription>Total: {students.length} students</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          Earned on {new Date(student.earnedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default page
