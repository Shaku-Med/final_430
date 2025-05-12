"use client";

import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, Suspense, Component, ErrorInfo, ReactNode, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Lock, Unlock, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "../../../projects/components/FileUpload";
import { toast } from "sonner";
import Cookies from "js-cookie";
import SetQuickToken from '@/app/account/Actions/SetQuickToken';
// import webpush from 'web-push';

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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open onOpenChange={() => window.history.back()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                Something went wrong while loading the task creation form.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-red-500">{this.state.error?.message}</p>
              <Button onClick={() => this.setState({ hasError: false, error: null })}>
                Try again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <Dialog open onOpenChange={() => window.history.back()}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <LoadingFallback />
});

function NewTaskModal() {
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

  useEffect(() => {
    const fetchVAPIDKeys = async () => {
      try {
        const response = await fetch('/api/webpush');
        const data = await response.json();
        console.log('VAPID Keys:', data.vapidKeys);
      } catch (error) {
        console.error('Error fetching VAPID keys:', error);
      }
    };

    fetchVAPIDKeys();
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    let dueDateTime = null;
    if (newTask.dueDate) {
      dueDateTime = new Date(`${newTask.dueDate}T${newTask.dueTime || '00:00'}`);
    }

    try {
      let taskToken = await SetQuickToken(`task_token`);
      if (!taskToken) {
        toast.error(`Failed to create task.`);
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        privacy: newTask.privacy,
        priority: newTask.priority,
        dueDate: dueDateTime?.toISOString().split('T')[0] || null,
        dueTime: dueDateTime?.toTimeString().split(' ')[0] || null,
        tags: newTask.tags,
        assignee: newTask.assignee,
        attachments: newTask.attachments.map(file => ({
          id: file.id,
          name: file.customName || file.file.name,
          size: file.file.size,
          lastModified: file.file.lastModified,
          url: file.url,
          path: file.path
        })),
        notifications: {
          email: true,
          push: true
        }
      };

      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Cookies.get('session') || ''
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      toast.success('Task created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
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

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleCreateTask}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NewTaskModalWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <NewTaskModal />
      </Suspense>
    </ErrorBoundary>
  );
}