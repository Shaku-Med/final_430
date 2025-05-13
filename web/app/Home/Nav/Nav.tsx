'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  Bell, 
  MessageSquare, 
  Settings, 
  LogOut, 
  User, 
  Layers,
  Users,
  Shield,
  Lightbulb
} from 'lucide-react';
import Logo from '../Icons/Logo';
import { Separator } from '@/components/ui/separator';

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        `fixed w-full top-0 left-0 z-[1000] px-4 transition-all duration-300`,
        scrolled 
          ? "bg-background backdrop-blur-md border-b shadow-sm" 
          : "sm:bg-[transparent] border-none bg-background",
      )}
    >
      <div className=" container mx-auto px-4 md:px-6 w-full flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 z-[100000]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-1 text-xl font-bold px-3 py-2">
                  <Link href="/" className="flex items-center gap-1">
                    <Logo svgClassName="w-12 h-12" pathClassName="fill-foreground"/>
                    <div className="flex items-center gap-1">
                      <span className='line-clamp-1'>SpotLight</span>
                      <span><Lightbulb size={10}/></span>
                    </div>
                  </Link>
                </div>
                <Separator/>
                
                <div className="px-2 py-6 flex-1 overflow-auto">
                  <div className="space-y-1 px-2">
                    <SheetClose asChild>
                      <Link href="/projects" className="flex items-center gap-3 h-12 px-3 py-2 rounded-md hover:bg-accent w-full">
                        <Layers className="h-5 w-5" />
                        Projects
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/teams" className="flex items-center gap-3 h-12 px-3 py-2 rounded-md hover:bg-accent w-full">
                        <Users className="h-5 w-5" />
                        Teams
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/privacy" className="flex items-center gap-3 h-12 px-3 py-2 rounded-md hover:bg-accent w-full">
                        <Shield className="h-5 w-5" />
                        Privacy
                      </Link>
                    </SheetClose>
                  </div>
                </div>
                
                <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Link href="/account/login" className="flex-1">
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/account/signup" className="flex-1">
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center gap-1 text-xl font-bold">
            <Logo svgClassName="w-12 h-12" pathClassName="fill-foreground"/>
            <div className="flex items-center gap-1">
              <span>SpotLight</span>
              <span><Lightbulb size={10}/></span>
            </div>
          </Link>
          
          <div className="hidden md:flex ml-6 space-x-2">
            <Link href="/projects" className="px-2 py-2 text-sm font-medium hover:text-primary transition-colors">
              Projects
            </Link>
            <Link href="/teams" className="px-2 py-2 text-sm font-medium hover:text-primary transition-colors">
              Teams
            </Link>
            <Link href="/privacy" className="px-2 py-2 text-sm font-medium hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-3">
            <Link href="/account/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/account/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
          
          {/* <div className="flex items-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  <Button variant="ghost" size="sm">Mark all as read</Button>
                </div>
                <div className="max-h-80 overflow-auto py-2">
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className="bg-primary/10 rounded-full p-2">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">New team member joined</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className="bg-primary/10 rounded-full p-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">New comment on your post</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className="bg-primary/10 rounded-full p-2">
                        <Layers className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">Project status updated</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-4 py-2 border-b">
                  <h4 className="font-medium">Messages</h4>
                </div>
                <div className="py-2">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex gap-3 items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/api/placeholder/32/32" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Jane Doe</p>
                        <p className="text-xs text-muted-foreground truncate w-40">Hey, do you have a minute to talk?</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex gap-3 items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/api/placeholder/32/32" alt="User" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">John Smith</p>
                        <p className="text-xs text-muted-foreground truncate w-40">Project update: we're on track for the deadline</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-center text-primary">
                  View all messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback className="bg-primary/10 text-primary">UN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-3 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">User Name</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                </div>
                <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600 h-10">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Nav;