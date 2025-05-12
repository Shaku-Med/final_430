export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
  }
  
  export interface QuickAction {
    name: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
  }