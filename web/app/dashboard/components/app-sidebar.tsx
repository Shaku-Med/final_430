"use client";
import { useState, createContext, useContext, ReactNode, JSX } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
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
  Lightbulb
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

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface QuickLink {
  name: string;
  href: string;
}

interface Course {
  id: string;
  name: string;
  unreadContent?: number;
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
    title: "Dashboard",
    icon: BookOpen,
    href: "/dashboard",
  },
  {
    title: "Courses",
    icon: GraduationCap,
    href: "/courses",
  },
  {
    title: "Assignments",
    icon: BookMarked,
    href: "/assignments",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/schedule",
  },
  {
    title: "Achievements",
    icon: Award,
    href: "/achievements",
  },
];

const quickLinks: QuickLink[] = [
  { name: "Transcript", href: "/transcript" },
  { name: "Resources", href: "/resources" },
  { name: "Help Center", href: "/help" },
  { name: "Library", href: "/library" },
];

const courses: Course[] = [
  { id: "cs101", name: "Introduction to Programming", unreadContent: 2 },
  { id: "cs201", name: "Data Structures" },
  { id: "math240", name: "Linear Algebra" },
  { id: "eng101", name: "English Composition" },
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

// Sidebar content component that can be shared between mobile and desktop
export function SidebarContent({ onClose }: { onClose?: () => void }): JSX.Element {
  const currentPath = usePathname();
  const [openSection, setOpenSection] = useState<string>("courses");
  
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

      <div className="p-4 border-b bg-card">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div>
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
              open={openSection === "courses"} 
              onOpenChange={() => setOpenSection(openSection === "courses" ? "" : "courses")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  <span>My Courses</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSection === "courses" ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-10 pr-3 py-1">
                <ul className="space-y-1">
                  {courses.map((course) => (
                    <li key={course.id}>
                      <Link 
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted"
                        onClick={onClose}
                      >
                        <span className="truncate">{course.name}</span>
                        {course.unreadContent && (
                          <Badge variant="secondary" className="ml-2 px-1.5">{course.unreadContent}</Badge>
                        )}
                      </Link>
                    </li>
                  ))}
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
        <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
          {user.notifications > 0 && (
            <Badge variant="destructive" className="ml-auto">{user.notifications}</Badge>
          )}
        </Button>
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
    </div>
  );
}

export function SidebarTrigger(): JSX.Element {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  
  return (
    <div className="md:hidden fixed top-0 left-0 z-30 m-4">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 max-w-full">
          <SidebarContent onClose={() => setIsMobileMenuOpen(true)} />
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