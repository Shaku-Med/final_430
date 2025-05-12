// components/layout/topbar/data.ts
import { NotificationItem, QuickAction } from './types';
import { 
  Plus, 
  Search, 
  Clock, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

export const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New project assigned',
    description: 'You have been assigned to Project Apollo',
    time: '5m ago',
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Meeting reminder',
    description: 'Team standup in 15 minutes',
    time: '15m ago',
    read: false,
    type: 'warning'
  },
  {
    id: '3',
    title: 'Task completed',
    description: 'Alex completed the deployment task',
    time: '1h ago',
    read: true,
    type: 'success'
  },
  {
    id: '4',
    title: 'New comment',
    description: 'Sarah commented on your report',
    time: '3h ago',
    read: true,
    type: 'info'
  }
];

export const getQuickActions = (): QuickAction[] => {
  return [
    { 
      name: "New Project", 
      shortcut: "Ctrl+N", 
      icon: Plus,
      route: "/dashboard/projects/new"
    },
    { 
      name: "Search Projects", 
      shortcut: "Ctrl+K", 
      icon: Search,
      route: "/dashboard/projects"
    },
    { 
      name: "Recent Activity", 
      shortcut: "Ctrl+R", 
      icon: Clock,
      route: "/dashboard/activity"
    },
    { 
      name: "View Messages", 
      shortcut: "Ctrl+M", 
      icon: MessageSquare,
      route: "/dashboard/messages"
    },
    { 
      name: "Settings", 
      shortcut: "Ctrl+,", 
      icon: Settings,
      route: "/dashboard/settings"
    }
  ];
};

export const quickActions = getQuickActions();