"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Student {
  id: string;
  name: string;
  avatar?: string;
  earnedDate: string;
}

// Sample achievement data - In a real app, this would come from an API
const getAchievementData = (id: string) => {
  const achievements = {
    "1": {
      id: "1",
      title: "Task Master",
      description: "Complete 50 tasks successfully",
      totalEarned: 156,
      totalUsers: 200,
      category: "Productivity"
    },
    "2": {
      id: "2",
      title: "Early Bird",
      description: "Complete 10 tasks before 9 AM",
      totalEarned: 89,
      totalUsers: 200,
      category: "Habits"
    },
    "3": {
      id: "3",
      title: "Project Champion",
      description: "Successfully complete 5 projects",
      totalEarned: 112,
      totalUsers: 200,
      category: "Projects"
    },
    "4": {
      id: "4",
      title: "Consistency King",
      description: "Maintain a 7-day streak",
      totalEarned: 45,
      totalUsers: 200,
      category: "Streaks"
    }
  };
  return achievements[id as keyof typeof achievements];
};

// Sample student data - In a real app, this would come from an API
const getStudentsForAchievement = (achievementId: string): Student[] => {
  return [
    {
      id: "1",
      name: "John Doe",
      earnedDate: "2024-03-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      earnedDate: "2024-03-14",
    },
    {
      id: "3",
      name: "Mike Johnson",
      earnedDate: "2024-03-13",
    },
  ];
};

export default function AchievementPage({ params }: { params: { id: string } }) {
  const achievement = getAchievementData(params.id);
  const students = getStudentsForAchievement(params.id);

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
    );
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
              <CardTitle>Achievement Details</CardTitle>
              <CardDescription>{achievement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Category</span>
                  <span>{achievement.category}</span>
                </div>
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

        <div className="lg:col-span-1">
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
                            .map((n) => n[0])
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
  );
} 