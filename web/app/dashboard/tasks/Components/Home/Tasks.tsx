"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  createdAt: Date;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === "pending" ? "completed" : "pending" }
        : task
    ));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Button onClick={() => router.push("/dashboard/tasks/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <CardDescription>{task.description}</CardDescription>
                <p className="text-sm text-muted-foreground mt-2">
                  Created: {task.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 