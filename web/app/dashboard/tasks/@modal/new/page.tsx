"use client";

import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";


const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function NewTaskModal() {
  const router = useRouter();
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      createdAt: new Date(),
    };

    // Here you would typically make an API call to save the task
    // For now, we'll just close the modal
    router.back();
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className=" min-w-fit max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list with rich markdown description
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title">Title</label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <div data-color-mode="system">
              <MDEditor
                value={newTask.description}
                onChange={(value) => setNewTask({ ...newTask, description: value || '' })}
                height={300}
                preview="edit"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleCreateTask}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 