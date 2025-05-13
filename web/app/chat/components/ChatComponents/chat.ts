
export interface User {
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "offline" | "away" | "busy";
    lastSeen?: Date;
    isGroup?: boolean;
    members?: User[];
  }
  
  export interface Message {
    id: string;
    content: string;
    sender: User;
    timestamp: Date;
    status: "sending" | "sent" | "delivered" | "read";
    isOwn: boolean;
    attachments?: {
      type: "image" | "file" | "voice";
      url: string;
      name: string;
    }[];
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    isGroup: boolean;
  }