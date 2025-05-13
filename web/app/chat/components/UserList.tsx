"use client";

import { useState, useEffect, JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Star, 
  Pin, 
  Check,
  MessageSquare,
  Users,
  UserPlus,
  UserMinus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FilterState } from "./SidebarComponents/types";
import { motion, AnimatePresence } from "framer-motion";

interface User {
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
  isGroup: boolean;
  members?: string[];
}

interface UserListProps {
  searchQuery: string;
  filters: FilterState;
}

export function UserList({ searchQuery, filters }: UserListProps): JSX.Element {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Doe",
      avatar: "/avatars/john.jpg",
      lastMessage: "Hey, just following up on the project...",
      time: "2 min ago",
      unread: 3,
      status: "online",
      isPinned: true,
      isStarred: false,
      date: new Date(),
      isArchived: false,
      isShared: true,
      isGroup: false
    },
    {
      id: 2,
      name: "Alice Smith",
      avatar: "/avatars/alice.jpg",
      lastMessage: "Let me know when you're free to discuss",
      time: "1 hr ago",
      unread: 0,
      status: "away",
      isPinned: false,
      isStarred: true,
      date: new Date(Date.now() - 86400000),
      isArchived: false,
      isShared: false,
      isGroup: false
    },
    {
      id: 3,
      name: "Robert Johnson",
      avatar: "/avatars/robert.jpg",
      lastMessage: "I've shared the design files with you",
      time: "Yesterday",
      unread: 0,
      status: "offline",
      isPinned: false,
      isStarred: false,
      date: new Date(Date.now() - 172800000),
      isArchived: true,
      isShared: true,
      isGroup: false
    },
    {
      id: 4,
      name: "Project Team",
      avatar: "/avatars/group.jpg",
      lastMessage: "Emily: The meeting is scheduled for tomorrow",
      time: "3 days ago",
      unread: 5,
      status: "online",
      isPinned: false,
      isStarred: true,
      date: new Date(Date.now() - 259200000),
      isArchived: false,
      isShared: true,
      isGroup: true,
      members: ["Emily Davis", "John Doe", "Robert Johnson", "Alice Smith"]
    },
    {
      id: 5,
      name: "Design Team",
      avatar: "/avatars/design-team.jpg",
      lastMessage: "Alice: Here's the latest mockup for review",
      time: "1 day ago",
      unread: 2,
      status: "online",
      isPinned: true,
      isStarred: false,
      date: new Date(Date.now() - 86400000),
      isArchived: false,
      isShared: true,
      isGroup: true,
      members: ["Alice Smith", "Emily Davis", "Robert Johnson"]
    },
    {
      id: 6,
      name: "Emily Davis",
      avatar: "/avatars/emily.jpg",
      lastMessage: "The meeting is scheduled for tomorrow",
      time: "3 days ago",
      unread: 1,
      status: "online",
      isPinned: false,
      isStarred: false,
      date: new Date(Date.now() - 259200000),
      isArchived: false,
      isShared: false,
      isGroup: false
    },
  ]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [receivedMessageId, setReceivedMessageId] = useState<number | null>(null);

  const toggleStar = (userId: number): void => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isStarred: !user.isStarred } : user
    ));
  };

  const togglePin = (userId: number): void => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isPinned: !user.isPinned } : user
    ));
  };

  const markAsRead = (userId: number): void => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, unread: 0 } : user
    ));
  };

  const archiveChat = (userId: number): void => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isArchived: !user.isArchived } : user
    ));
  };

  const addToGroup = (userId: number): void => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser && !selectedUser.isGroup) {
      const newGroup: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: `${selectedUser.name}'s Group`,
        avatar: "/avatars/group.jpg",
        lastMessage: `New group created with ${selectedUser.name}`,
        time: "Just now",
        unread: 0,
        status: "online",
        isPinned: false,
        isStarred: false,
        date: new Date(),
        isArchived: false,
        isShared: true,
        isGroup: true,
        members: [selectedUser.name, "You"]
      };
      
      setUsers([newGroup, ...users]);
      simulateNewMessage(newGroup.id);
    }
  };

  const leaveGroup = (userId: number): void => {
    const group = users.find(user => user.id === userId);
    if (group && group.isGroup && group.members && group.members.length > 2) {
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              members: user.members?.filter(member => member !== "You"),
              lastMessage: "You left the group"
            } 
          : user
      ));
    } else if (group && group.isGroup) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const simulateNewMessage = (userId: number) => {
    setReceivedMessageId(userId);
    
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          lastMessage: `New message at ${new Date().toLocaleTimeString()}`,
          time: "Just now",
          unread: user.unread + 1,
          date: new Date()
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    setTimeout(() => {
      setReceivedMessageId(null);
    }, 500);
  };

  useEffect(() => {
    let result = users;
    
    if (searchQuery) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.isGroup && user.members?.some(member => 
          member.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    if (filters) {
      if (filters.unread) {
        result = result.filter(user => user.unread > 0);
      }
      
      if (filters.recent) {
        const oneDayAgo = new Date(Date.now() - 86400000);
        result = result.filter(user => user.date > oneDayAgo);
      }
      
      if (filters.favorites) {
        result = result.filter(user => user.isStarred);
      }

      if (filters.archived === false) {
        result = result.filter(user => !user.isArchived);
      }

      if (filters.shared) {
        result = result.filter(user => user.isShared);
      }
      
      if (filters.date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        switch (filters.date) {
          case 'today':
            result = result.filter(user => user.date >= today);
            break;
          case 'yesterday':
            result = result.filter(user => user.date >= yesterday && user.date < today);
            break;
          case 'thisWeek':
            result = result.filter(user => user.date >= thisWeekStart);
            break;
          case 'thisMonth':
            result = result.filter(user => user.date >= thisMonthStart);
            break;
          default:
            break;
        }
      }
    }
    
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setFilteredUsers(result);
  }, [searchQuery, users, filters]);

  return (
    <div className="space-y-1 p-2">
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-sm font-medium">No conversations found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              layout
              layoutId={`user-${user.id}`}
              initial={receivedMessageId === user.id ? { scale: 0.95, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30, 
                duration: 0.3 
              }}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group ${
                user.unread > 0 ? "bg-accent/50" : ""
              }`}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.isGroup ? (
                  <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {user.members?.length}
                  </span>
                ) : (
                  <span 
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                      user.status === "online" ? "bg-green-500" : 
                      user.status === "away" ? "bg-yellow-500" : "bg-gray-400"
                    }`}
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-medium truncate">
                      {user.name}
                      {user.isGroup && <Users className="inline h-3 w-3 ml-1 text-muted-foreground" />}
                    </h3>
                    {user.isPinned && (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{user.time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user.lastMessage}
                  </p>
                  <div className="flex items-center">
                    {user.isStarred && (
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    )}
                    {user.unread > 0 && (
                      <Badge 
                        className="h-5 w-5 flex items-center justify-center p-0"
                      >
                        {user.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleStar(user.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        {user.isStarred ? "Remove star" : "Star conversation"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePin(user.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {user.isPinned ? "Unpin" : "Pin to top"}
                      </DropdownMenuItem>
                      {user.unread > 0 && (
                        <DropdownMenuItem onClick={() => markAsRead(user.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {user.isGroup ? (
                        <DropdownMenuItem onClick={() => leaveGroup(user.id)}>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Leave group
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => addToGroup(user.id)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create group with this user
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => archiveChat(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        {user.isArchived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      
      <div className="fixed bottom-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => simulateNewMessage(filteredUsers[Math.floor(Math.random() * filteredUsers.length)]?.id)}
                className="rounded-full w-12 h-12 shadow-lg"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simulate new message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}