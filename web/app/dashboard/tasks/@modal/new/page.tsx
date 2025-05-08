"use client";

import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Lock, Unlock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "../../../projects/components/FileUpload";

interface FileChunk {
  id: string;
  blob: Blob;
  name: string;
  index: number;
  totalChunks: number;
  objectUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  path?: string;
  url?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'chunking' | 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
  chunks: FileChunk[];
  chunkingProgress?: number;
  path?: string;
  url?: string;
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function NewTaskModal() {
  const router = useRouter();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    privacy: "private",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    tags: [] as string[],
    assignee: "",
    attachments: [] as UploadedFile[],
  });
  const [tagInput, setTagInput] = useState("");

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    let dueDateTime = null;
    if (newTask.dueDate) {
      dueDateTime = new Date(`${newTask.dueDate}T${newTask.dueTime || '00:00'}`);
    }

    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      createdAt: new Date(),
      privacy: newTask.privacy,
      dueDate: dueDateTime,
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
      <DialogContent className="min-w-fit max-w-5xl max-h-full rounded-none border-none shadow-none overflow-auto">
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
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label>Due Time</label>
              <Input
                type="time"
                value={newTask.dueTime}
                onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label>Assignee</label>
            <Input
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              placeholder="Enter assignee name"
            />
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
                fullscreen={false}
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