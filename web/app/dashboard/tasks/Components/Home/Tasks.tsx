"use client";

import { useState, useCallback, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dynamic from 'next/dynamic';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlusCircle, 
  Clock, 
  Loader2, 
  Calendar, 
  User, 
  Paperclip, 
  Bell, 
  ChevronRight,
  Lock,
  Pencil,
  Trash2,
  CheckCircle2
} from "lucide-react";

// API Service
import SetQuickToken from "@/app/account/Actions/SetQuickToken";

// Types
interface Task {
  task_id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  created_at: string;
  dueDate?: string;
  dueTime?: string;
  priority: "low" | "medium" | "high";
  privacy: string;
  tags: string[];
  assignee: string;
  attachments: any[];
  notifications: any[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

// Utility function for priority styling
const getPriorityBadgeStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-600 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-600 border-green-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-md" />
});

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete }: { 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      
      const response = await fetch(`/api/tasks/${task.task_id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': Cookies.get('session') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status');
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['tasks'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: TasksResponse) => ({
            ...page,
            tasks: page.tasks.map((t: Task) => 
              t.task_id === task.task_id ? { ...t, status: newStatus } : t
            )
          })),
        };
      });
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update task status");
    }
  };
  
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => router.push(`/dashboard/tasks/${task.task_id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
            {task.title}
          </CardTitle>
          {task.privacy === 'private' && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${getPriorityBadgeStyles(task.priority)}`}>
            {task.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleStatus}
            className={`hover:bg-gray-100 ${
              task.status === "completed" ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {task.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="hover:bg-gray-100"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.task_id);
            }}
            className="hover:bg-gray-100 text-red-500 hover:text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-3 line-clamp-2">{task.description}</CardDescription>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(task.dueDate).toLocaleDateString()}
                {task.dueTime && ` at ${task.dueTime}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{task.assignee}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Paperclip className="h-4 w-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Notifications */}
            {task.notifications && task.notifications.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Bell className="h-4 w-4" />
                <span>{task.notifications.length}</span>
              </div>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
};

// TaskList Skeleton Component
const TaskListSkeleton = () => (
  <>
    {[1, 2, 3].map((n) => (
      <Card key={n} className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

// Empty State Component
const EmptyState = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <PlusCircle className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-4 text-center">
        Create your first task to get started with your productivity journey.
      </p>
      <Button onClick={() => window.location.href = "/dashboard/tasks/new"}>
        <PlusCircle className="mr-2 h-4 w-4" /> New Task
      </Button>
    </CardContent>
  </Card>
);

// Main Component
export default function TasksPage({T}: {T?: Task[]}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  // Fetch tasks with react-query
  const fetchTasks = async ({ pageParam = 1 }) => {
    if (!T) return { tasks: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    
    // Calculate pagination
    const limit = 10;
    const startIndex = (pageParam - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = T.slice(startIndex, endIndex);
    
    return {
      tasks: paginatedTasks,
      pagination: {
        total: T.length,
        page: pageParam,
        limit: limit,
        totalPages: Math.ceil(T.length / limit)
      }
    } as TasksResponse;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    getNextPageParam: (lastPage: TasksResponse) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskToEdit) throw new Error('No task selected for editing');
      
      const response = await fetch(`/api/tasks/${taskToEdit.task_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': Cookies.get('session') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return { taskId: taskToEdit.task_id, ...editForm };
    },
    onSuccess: (updatedTask) => {
      // Optimistically update the cache
      queryClient.setQueryData(['tasks'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: TasksResponse) => ({
            ...page,
            tasks: page.tasks.map((task: Task) => 
              task.task_id === updatedTask.taskId ? { ...task, ...updatedTask } : task
            )
          })),
        };
      });
      
      toast.success("Task updated successfully");
      setTaskToEdit(null);
    },
    onError: () => {
      toast.error("Failed to update task. Please try again.");
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': Cookies.get('session') || '',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      return taskId;
    },
    onSuccess: (taskId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['tasks'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: TasksResponse) => ({
            ...page,
            tasks: page.tasks.filter((task: Task) => task.task_id !== taskId)
          })),
        };
      });
      
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete task. Please try again.");
    }
  });

  // Handle edit task
  const handleEditTask = useCallback(() => {
    editTaskMutation.mutate();
  }, [editTaskMutation]);

  // Handle delete task
  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  }, [deleteTaskMutation]);

  // Handle opening edit dialog
  const handleOpenEdit = useCallback((task: Task) => {
    setTaskToEdit(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate || "",
      priority: task.priority
    });
  }, []);

  // Load more when scroll reaches the bottom
  const handleScroll = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) {
      return;
    }

    const scrollContainer = document.querySelector('.dashboard_r');
    const scrollPosition = scrollContainer 
      ? scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 300
      : window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300;

    if (scrollPosition) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.dashboard_r');
    const targetElement = scrollContainer || window;
    
    targetElement.addEventListener('scroll', handleScroll);
    return () => targetElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // All tasks from all pages
  const allTasks = data?.pages.flatMap((page: TasksResponse) => page.tasks) || [];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Button onClick={() => router.push("/dashboard/tasks/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 dashboard_r">
        {status === 'pending' ? (
          <TaskListSkeleton />
        ) : status === 'error' ? (
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-red-500 mb-2">Failed to load tasks.</p>
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : allTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {allTasks.map((task: Task) => (
              <TaskCard 
                key={task.task_id} 
                task={task} 
                onEdit={handleOpenEdit}
                onDelete={setTaskToDelete}
              />
            ))}
            <div ref={ref} className="flex justify-center py-4">
              {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
          </>
        )}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!taskToEdit} onOpenChange={() => setTaskToEdit(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div data-color-mode="system" className="[&_.w-md-editor]:bg-background [&_.w-md-editor]:text-foreground [&_.w-md-editor-toolbar]:bg-muted [&_.w-md-editor-toolbar]:border-border">
                <MDEditor
                  value={editForm.description}
                  onChange={(value) => setEditForm(prev => ({ ...prev, description: value || "" }))}
                  height={200}
                  preview="edit"
                  fullscreen={false}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={editForm.priority}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskToEdit(null)}>Cancel</Button>
            <Button onClick={handleEditTask}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}