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

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://avatar.vercel.sh/john",
    status: "online",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://avatar.vercel.sh/jane",
    status: "away",
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "3",
    name: "Team Alpha",
    avatar: "https://avatar.vercel.sh/team",
    status: "online",
    isGroup: true,
    members: [
      {
        id: "1",
        name: "John Doe",
        status: "online",
      },
      {
        id: "2",
        name: "Jane Smith",
        status: "away",
      },
    ],
  },
];

// Mock Messages
export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hey, how are you?",
      sender: mockUsers[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      status: "read",
      isOwn: false,
    },
    {
      id: "2",
      content: "I'm good, thanks! How about you?",
      sender: mockUsers[1],
      timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
      status: "read",
      isOwn: true,
    },
    {
      id: "3",
      content: "Doing great! Want to catch up later?",
      sender: mockUsers[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
      status: "delivered",
      isOwn: false,
    },
  ],
  "2": [
    {
      id: "4",
      content: "Hello team!",
      sender: mockUsers[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      status: "read",
      isOwn: false,
    },
    {
      id: "5",
      content: "Hi everyone!",
      sender: mockUsers[1],
      timestamp: new Date(Date.now() - 1000 * 60 * 115), // 1 hour 55 minutes ago
      status: "read",
      isOwn: false,
    },
  ],
};

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: "1",
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages["1"][mockMessages["1"].length - 1],
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: "2",
    participants: mockUsers[2].members || [],
    lastMessage: mockMessages["2"][mockMessages["2"].length - 1],
    unreadCount: 2,
    isGroup: true,
  },
];

// Current user (you)
export const currentUser: User = {
  id: "2",
  name: "Jane Smith",
  avatar: "https://avatar.vercel.sh/jane",
  status: "online",
}; 