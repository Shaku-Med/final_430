"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Medal, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: React.ReactNode;
  category: string;
  dateEarned?: string;
}

const userAchievements: Achievement[] = [
  {
    id: "1",
    title: "Task Master",
    description: "Complete 50 tasks successfully",
    progress: 75,
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    category: "Productivity",
    dateEarned: "2024-03-15"
  },
  {
    id: "2",
    title: "Early Bird",
    description: "Complete 10 tasks before 9 AM",
    progress: 40,
    icon: <Star className="w-6 h-6 text-blue-500" />,
    category: "Habits"
  },
  {
    id: "3",
    title: "Project Champion",
    description: "Successfully complete 5 projects",
    progress: 60,
    icon: <Medal className="w-6 h-6 text-green-500" />,
    category: "Projects"
  },
  {
    id: "4",
    title: "Consistency King",
    description: "Maintain a 7-day streak",
    progress: 85,
    icon: <Award className="w-6 h-6 text-purple-500" />,
    category: "Streaks"
  }
];

export default function MyAchievementsPage() {
  const earnedAchievements = userAchievements.filter(a => a.dateEarned);
  const inProgressAchievements = userAchievements.filter(a => !a.dateEarned);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/achievements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">My Achievements</h1>
      </div>

      {earnedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Earned Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedAchievements.map((achievement) => (
              <Link 
                key={achievement.id} 
                href={`/dashboard/achievements/${achievement.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow bg-green-50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{achievement.title}</CardTitle>
                      {achievement.icon}
                    </div>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Earned on</span>
                        <span>{new Date(achievement.dateEarned!).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Category: {achievement.category}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {inProgressAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressAchievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{achievement.title}</CardTitle>
                    {achievement.icon}
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Category: {achievement.category}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Achievement Stats</CardTitle>
            <CardDescription>Your personal achievement progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Achievements Earned</span>
                <span>{earnedAchievements.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Achievements In Progress</span>
                <span>{inProgressAchievements.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{Math.round((earnedAchievements.length / userAchievements.length) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 