"use client";

import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Calendar as CalendarIcon, Lock, Unlock, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileUpload } from "../../../projects/components/FileUpload";

interface UploadedFile {
  id: string;
  file: globalThis.File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function NewTaskModal() {
  const router = useRouter();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    privacy: "private",
    dueDate: null as Date | null,
    priority: "medium",
    tags: [] as string[],
    assignee: "",
    attachments: [] as UploadedFile[],
  });
  const [tagInput, setTagInput] = useState("");

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      createdAt: new Date(),
      privacy: newTask.privacy,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      tags: newTask.tags,
      assignee: newTask.assignee,
      attachments: newTask.attachments,
    };

    // Here you would typically make an API call to save the task
    // For now, we'll just close the modal
    router.back();
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !newTask.tags.includes(tag));
      
      if (newTags.length > 0) {
        setNewTask({ ...newTask, tags: [...newTask.tags, ...newTags] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setNewTask(prev => ({
      ...prev,
      attachments: files
    }));
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="min-w-fit max-w-5xl">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label>Privacy</label>
              <Select
                value={newTask.privacy}
                onValueChange={(value) => setNewTask({ ...newTask, privacy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <Unlock className="mr-2 h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label>Priority</label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label>Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newTask.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate || undefined}
                    onSelect={(date) => setNewTask({ ...newTask, dueDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label>Assignee</label>
              <Input
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Enter assignee name"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label>Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tags (comma-separated)"
              />
              <Button onClick={handleAddTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newTask.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label>Description</label>
            <div data-color-mode="system">
              <MDEditor
                value={newTask.description}
                onChange={(value) => setNewTask({ ...newTask, description: value || '' })}
                height={300}
                preview="edit"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label>Attachments</label>
            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={15}
              maxSize={200 * 1024 * 1024}
            />
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