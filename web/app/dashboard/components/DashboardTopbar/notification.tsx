'use client'

import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationItem } from './types';
import { initialNotifications } from './data';

interface NotificationsDropdownProps {
  children: React.ReactNode;
}

export function NotificationsDropdown({ children }: NotificationsDropdownProps) {
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  const unreadNotifications = userNotifications.filter(notification => !notification.read).length;

  const markAllAsRead = () => {
    setUserNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  const markAsRead = (id: string) => {
    setUserNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setUserNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {
                children ? children : (
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                )
              }
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between">
          <span>Notifications</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 text-xs font-normal"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userNotifications.length > 0 ? (
          userNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
              <div className={`w-full p-3 ${notification.read ? '' : 'bg-muted/50'} rounded-md m-1 flex gap-3`}>
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                  <div className="flex gap-2 mt-2">
                    {!notification.read && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No notifications</p>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-sm">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}