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

export const quickActions: QuickAction[] = [
  { name: "New Project", shortcut: "N P", icon: Plus },
  { name: "Search Projects", shortcut: "S P", icon: Search },
  { name: "Recent Activity", shortcut: "R A", icon: Clock },
  { name: "View Messages", shortcut: "V M", icon: MessageSquare },
  { name: "Settings", shortcut: "S T", icon: Settings }
];