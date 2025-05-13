"use client";
import { useState, createContext, useContext, ReactNode, JSX, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  BookMarked,
  Bell,
  Settings,
  User,
  Search,
  ChevronDown,
  Menu,
  X,
  LucideIcon,
  Filter,
  CircleSlash,
  Lightbulb,
  Plus,
  BlocksIcon,
  TvMinimalIcon,
  Blocks,
  Lock,
  Trash2,
  CheckCircle2,
  Clock,
  Pencil
} from "lucide-react";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent,
  SheetTrigger 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Separator } from "@/components/ui/separator";
import Logo from "@/app/Home/Icons/Logo";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { useIsMobile } from "../hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationsDropdown } from "./DashboardTopbar/notification";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/push-notifications';

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface QuickLink {
  name: string;
  href: string;
}

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

interface UserInfo {
  name: string;
  avatar: string;
  role: string;
  major: string;
  year: string;
  notifications: number;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    icon: BookOpen,
    href: "/dashboard",
  },
  {
    title: "Events",
    icon: GraduationCap,
    href: "/dashboard/events",
  },
  {
    title: "Projects",
    icon: BookMarked,
    href: "/dashboard/projects",
  },
  {
    title: "Tasks",
    icon: BlocksIcon,
    href: "/dashboard/tasks",
  },
  {
    title: "Student Videos",
    icon: TvMinimalIcon,
    href: "/dashboard/reels",
  },
  {
    title: "Achievements",
    icon: Award,
    href: "/dashboard/achievements",
  },
];

const quickLinks: QuickLink[] = [
  { name: "Create Event", href: "/dashboard/events/new" },
  { name: "Create Project", href: "/dashboard/projects/new" },
  { name: "Help Center", href: "/dashboard/help" },
  { name: "People", href: "/dashboard/people" },
];

const user: UserInfo = {
  name: "Alex Johnson",
  avatar: "/api/placeholder/40/40",
  role: "Student",
  major: "Computer Science",
  year: "Junior",
  notifications: 3
};

interface SidebarContextType {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
});

export function useSidebar(): SidebarContextType {
  return useContext(SidebarContext);
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  return (
    <SidebarContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-md" />
});

// Sidebar content component that can be shared between mobile and desktop
export function SidebarContent({ onClose }: { onClose?: () => void }): JSX.Element {
  const currentPath = usePathname();
  const [openSection, setOpenSection] = useState<string>("tasks");
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high"
  });
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/fetch?limit=5');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setUserTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Check if push notifications are supported and enabled
    if ('Notification' in window) {
      setPushNotificationEnabled(Notification.permission === 'granted');
      
      // Request permission if not already granted or denied
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setPushNotificationEnabled(permission === 'granted');
          if (permission === 'granted') {
            toast.success('Push notifications enabled');
          }
        });
      }
    }
  }, []);

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      // Update local state
      setUserTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleEditTask = async () => {
    if (!taskToEdit) return;

    try {
      const response = await fetch(`/api/tasks/${taskToEdit.task_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      // Update local state
      setUserTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === taskToEdit.task_id 
            ? { ...task, ...editForm }
            : task
        )
      );
      toast.success("Task updated successfully");
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task");
    } finally {
      setTaskToEdit(null);
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    try {
      const task = userTasks.find(t => t.task_id === taskId);
      if (!task) return;

      const newStatus = task.status === "completed" ? "pending" : "completed";
      
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task status');
      
      // Update local state
      setUserTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === taskId 
            ? { ...task, status: newStatus }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

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

  const handlePushNotificationToggle = async () => {
    try {
      if (pushNotificationEnabled) {
        await unsubscribeFromPushNotifications();
        setPushNotificationEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        await subscribeToPushNotifications();
        setPushNotificationEnabled(true);
        toast.success('Push notifications enabled');
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast.error('Failed to toggle push notifications');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 bg-card items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex items-center justify-center rounded-md">
            <Logo svgClassName="w-8 h-8 md:w-12 md:h-12" pathClassName="fill-foreground"/>
          </div>
          <div className="flex items-center gap-1">
            <span className='line-clamp-1 text-lg'>SpotLight</span>
            <span><Lightbulb size={10}/></span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          <nav className="space-y-1 relative">
            {navigationItems.map((item) => {
              const isActive = 
                (item.href === '/dashboard' && (currentPath === '/dashboard' || currentPath === '')) ||
                (item.href !== '/dashboard' && currentPath?.startsWith(item.href));
              
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="relative block"
                  onClick={onClose}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-md bg-primary shadow-md z-0"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {
                      item?.href?.startsWith(`/dashboard/tasks`) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Lock xlinkTitle={`Private`} size={10} className={` text-xs opacity-[.6]`}/>
                            </TooltipTrigger>
                            <TooltipContent>
                              Your Private Page
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    }
                    <span>{item.title}</span>
                    {item.title === "Assignments" && (
                      <Badge variant="outline" className="ml-auto bg-primary/10 hover:bg-primary/20">2</Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className="mt-2">
            <Collapsible 
              open={openSection === "tasks"} 
              onOpenChange={() => setOpenSection(openSection === "tasks" ? "" : "tasks")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Blocks className="h-4 w-4" />
                  <span>My Tasks</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSection === "tasks" ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-10 pr-3 py-1">
                <ul className="space-y-1">
                  {isLoading ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">Loading tasks...</li>
                  ) : userTasks.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">No tasks found</li>
                  ) : (
                    userTasks.map((task: Task) => (
                      <li key={task.task_id} className="group">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/dashboard/tasks/${task.task_id}`}
                            className={cn(
                              "flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                              currentPath === `/dashboard/tasks/${task.task_id}` && "bg-muted"
                            )}
                            onClick={onClose}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="truncate">{task.title}</p>
                              {task.dueDate && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                    {task.dueTime && ` at ${task.dueTime}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant={task.status === "completed" ? "default" : "secondary"}
                              className="ml-auto"
                            >
                              {task.status}
                            </Badge>
                          </Link>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(task.task_id);
                              }}
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(task);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskToDelete(task.task_id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                  <li>
                    <Link 
                      href="/dashboard/tasks"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                      onClick={onClose}
                    >
                      <Plus className="h-4 w-4" />
                      <span>View All Tasks</span>
                    </Link>
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 px-3 text-sm font-medium text-muted-foreground">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 px-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-center rounded-md bg-muted px-3 py-2 text-xs font-medium hover:bg-muted/80"
                  onClick={onClose}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t p-4 bg-card">
        <div className="space-y-2">
          <NotificationsDropdown>
            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {user.notifications > 0 && (
                <Badge variant="destructive" className="ml-auto">{user.notifications}</Badge>
              )}
            </Button>
          </NotificationsDropdown>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={handlePushNotificationToggle}
          >
            <Bell className="h-4 w-4" />
            <span>{pushNotificationEnabled ? 'Disable' : 'Enable'} Push Notifications</span>
          </Button>
        </div>
      </div>

      <div className="border-t p-3 bg-card">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.major} • {user.year}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t p-3 bg-card text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Student Spotlight. All rights reserved.
      </div>

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
    </div>
  );
}

export function SidebarTrigger(): JSX.Element {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  let isM = useIsMobile()
  
  return (
    <div className="md:hidden top-0 left-0 z-30">
      <Sheet open={!isM ? false : isMobileMenuOpen} onOpenChange={e => {
        setIsMobileMenuOpen(e)
      }}>
        <SheetTrigger asChild>
          <Button variant={`outline`} size="icon">
            {
              isMobileMenuOpen ?
              <X className="h-5 w-5" /> :
              <Menu className="h-5 w-5" />
            }
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 max-w-full min-w-[60%]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function AppSidebar(): JSX.Element {
  const isMobile = useIsMobile();
  const [loading, setloading] = useState<boolean>(false )
  // 
  return (
    <>
    <ResizablePanel hidden={isMobile} defaultSize={30} minSize={25} maxSize={50} className={`min-w-[350px] hidden md:block`}>
      <div className="hidden md:flex overflow-x-hidden h-full flex-col bg-muted/40 backdrop-blur-md border-r w-full transition-all duration-300">
        <SidebarContent />
      </div>
    </ResizablePanel>
    <ResizableHandle hidden={isMobile} className="bg-border hidden md:flex" withHandle/>
    </>
  );
}