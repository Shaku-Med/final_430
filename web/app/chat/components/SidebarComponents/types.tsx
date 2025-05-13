// Common types shared across components

export interface User {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    status: "online" | "away" | "offline";
    isPinned: boolean;
    isStarred: boolean;
    date: Date;
    isArchived: boolean;
    isShared: boolean;
  }
  
  export interface FilterState {
    unread: boolean;
    recent: boolean;
    favorites: boolean;
    archived?: boolean;
    shared?: boolean;
    date: string | null;
  }
  
  export type FilterType = "all" | "starred" | "pinned" | "recent" | "archived";
  
  export interface FilterItem {
    id: FilterType;
    label: string;
    icon: React.ElementType;
  }