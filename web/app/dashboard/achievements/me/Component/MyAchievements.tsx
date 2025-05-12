"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Medal, Award, ArrowLeft, Calendar, Rocket, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: string;
  category: string;
  dateEarned?: string;
  target: number;
  current: number;
  monthlyProgress: number;
  monthlyTarget: number;
  monthlyCurrent: number;
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

export default function MyAchievements({ achievements }: { achievements: Achievement[] }) {
  const earnedAchievements = achievements.filter(a => a.dateEarned);
  const inProgressAchievements = achievements.filter(a => !a.dateEarned);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

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

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month ({currentMonth})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {earnedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Earned Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earnedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="hover:shadow-lg transition-shadow bg-green-50">
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
                          <span>Earned on</span>
                          <span>{new Date(achievement.dateEarned!).toLocaleDateString()}</span>
                        </div>
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

          {inProgressAchievements.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">In Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressAchievements.map((achievement) => (
                  <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
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
                          <span>Progress</span>
                          <span>{achievement.current} / {achievement.target}</span>
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
        </TabsContent>

        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{achievement.title}</CardTitle>
                    {iconMap[achievement.icon]}
                  </div>
                  <CardDescription>Monthly Goal: {achievement.monthlyTarget} {achievement.category.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Progress</span>
                      <span>{achievement.monthlyCurrent} / {achievement.monthlyTarget}</span>
                    </div>
                    <Progress value={achievement.monthlyProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Category: {achievement.category}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
                <span>{Math.round((earnedAchievements.length / achievements.length) * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Progress</span>
                <span>{Math.round(achievements.reduce((sum, a) => sum + a.monthlyProgress, 0) / achievements.length)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 