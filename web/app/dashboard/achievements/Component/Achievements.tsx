"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Medal, Award, Users, Calendar, Rocket, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  title: string;
  description: string;
  totalEarned: number;
  totalUsers: number;
  icon: string;
  category: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  Trophy: <Trophy className="w-6 h-6 text-yellow-500" />,
  Star: <Star className="w-6 h-6 text-blue-500" />,
  Medal: <Medal className="w-6 h-6 text-green-500" />,
  Award: <Award className="w-6 h-6 text-purple-500" />,
  Calendar: <Calendar className="w-6 h-6 text-red-500" />,
  Rocket: <Rocket className="w-6 h-6 text-orange-500" />,
  Sun: <Sun className="w-6 h-6 text-yellow-400" />
};

const achievements: Achievement[] = [
  {
    id: "1",
    title: "Task Master",
    description: "Complete 50 tasks successfully",
    totalEarned: 156,
    totalUsers: 200,
    icon: "Trophy",
    category: "Productivity"
  },
  {
    id: "2",
    title: "Early Bird",
    description: "Complete 10 tasks before 9 AM",
    totalEarned: 89,
    totalUsers: 200,
    icon: "Star",
    category: "Habits"
  },
  {
    id: "3",
    title: "Project Champion",
    description: "Successfully complete 5 projects",
    totalEarned: 112,
    totalUsers: 200,
    icon: "Medal",
    category: "Projects"
  },
  {
    id: "4",
    title: "Consistency King",
    description: "Maintain a 7-day streak",
    totalEarned: 45,
    totalUsers: 200,
    icon: "Award",
    category: "Streaks"
  }
];

export default function AchievementsPage({data}: {data: Achievement[]}) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <Link href="/dashboard/achievements/me">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Achievements
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((achievement) => (
          <Link 
            key={achievement.id} 
            href={`/dashboard/achievements/${achievement.id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{achievement.title}</CardTitle>
                  {iconMap[achievement.icon]}
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Earned</span>
                    <span>{achievement.totalEarned} students</span>
                  </div>
                  <Progress value={(achievement.totalEarned / achievement.totalUsers) * 100} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Category: {achievement.category}</span>
                    <span>{Math.round((achievement.totalEarned / achievement.totalUsers) * 100)}% completion rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Community Stats</CardTitle>
            <CardDescription>Overall achievement statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Achievements Earned</span>
                <span>{data.reduce((sum, achievement) => sum + achievement.totalEarned, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Achievements per Student</span>
                <span>{(data.reduce((sum, achievement) => sum + achievement.totalEarned, 0) / data.length).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Most Popular Achievement</span>
                <span>{data.reduce((max, achievement) => 
                  achievement.totalEarned > (max.totalEarned || 0) ? achievement : max
                ).title}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 