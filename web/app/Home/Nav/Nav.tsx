'use client'
import React, { useState, useEffect, useLayoutEffect } from 'react';
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
  Lightbulb,
  Sun,
  Moon,
  Monitor,
  Users2
} from 'lucide-react';
import Logo from '../Icons/Logo';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SignOff from './SignOff';
import ProfileDropDown from '@/app/dashboard/components/ProfileDropDown';

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add system theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const body = document.querySelector('body');
        if (body) {
          body.classList.remove('light', 'dark');
          body.classList.add(e.matches ? 'dark' : 'light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  useLayoutEffect(() => {
    const profile = (window as any)._profile;
    if (profile) {
      try {
        const parsedProfile = typeof profile === 'string' ? JSON.parse(profile) : profile;
        setUserProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
  }, []);

  const handleThemeChange = async (newTheme: string) => {
    // Immediately update the theme
    setTheme(newTheme);
    
    // Directly update body class for immediate visual feedback
    const body = document.querySelector('body');
    if (body) {
      // Remove all theme classes
      body.classList.remove('light', 'dark');
      
      // For system theme, we need to check the system preference
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        body.classList.add(systemTheme);
      } else {
        body.classList.add(newTheme);
      }
    }
    
    try {
      const response = await fetch('/api/users/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert theme on error
      setTheme(theme || 'system');
      // Revert body class on error
      if (body) {
        body.classList.remove('light', 'dark');
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          body.classList.add(systemTheme);
        } else if (theme) {
          body.classList.add(theme);
        }
      }
    }
  };

  return (
    <div 
      className={cn(
        `fixed w-full top-0 left-0 z-[1000] px-4 transition-all duration-300`,
        scrolled 
          ? "bg-background backdrop-blur-md border-b shadow-sm" 
          : "sm:bg-[transparent] border-none bg-background",
      )}
    >
      <div className="container mx-auto px-4 md:px-6 w-full flex h-16 items-center justify-between">
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
                    <SheetClose asChild>
                      <Link href="/about" className="flex items-center gap-3 h-12 px-3 py-2 rounded-md hover:bg-accent w-full">
                        <Users2 className="h-5 w-5" />
                        About us
                      </Link>
                    </SheetClose>
                  </div>
                </div>
                
                <div className="p-4 border-t mt-auto">
                  {userProfile ? (
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile.profile} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.name?.[0] || userProfile.firstname?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{userProfile.name || `${userProfile.firstname} ${userProfile.lastname}`}</p>
                        <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                      </div>
                    </div>
                  ) : (
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
                  )}
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
            <Link href="/about" className="px-2 py-2 text-sm font-medium hover:text-primary transition-colors">
              About us
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {userProfile && (
            <Select
              value={theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {userProfile ? (
            <ProfileDropDown Topbar={true}/>
          ) : (
            <div className="flex gap-3">
              <Link href="/account/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/account/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nav;