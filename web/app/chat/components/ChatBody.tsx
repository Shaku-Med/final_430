"use client";

import { useEffect, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";
import { User, Message } from './ChatComponents/chat'

interface ChatBodyProps {
  messages: Message[];
  typingUsers?: User[];
  currentUserId: string;
}

type MessageGroup = {
  date: string;
  messages: Message[];
};

export function ChatBody({ messages, typingUsers = [], currentUserId }: ChatBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change or someone starts/stops typing
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Group messages by date and unread status
  const groupedMessages = useMemo(() => {
    // First find the first unread message
    const firstUnreadIndex = messages.findIndex(
      (msg) => !msg.isOwn && msg.status !== "read"
    );

    // Group messages by date
    const groups: MessageGroup[] = [];
    let currentDate = "";
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      // Format date for grouping (YYYY-MM-DD)
      const messageDate = message.timestamp.toISOString().split("T")[0];
      
      // If this is a new date, create a new group
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: [...currentGroup],
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
      
      if (index === messages.length - 1) {
        groups.push({
          date: currentDate,
          messages: [...currentGroup],
        });
      }
    });

    return { groups, firstUnreadIndex };
  }, [messages]);

  const getMessageStatus = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-6">
        {groupedMessages.groups.map((group, groupIndex) => (
          <div key={group.date} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {formatDateHeader(group.date)}
              </div>
            </div>
            
            {/* Messages */}
            {group.messages.map((message, messageIndex) => {
              // Check if this is the first unread message
              const isFirstUnread = 
                groupedMessages.firstUnreadIndex !== -1 && 
                messages.indexOf(message) === groupedMessages.firstUnreadIndex;
              
              return (
                <div key={message.id} className="space-y-4">
                  {/* Unread messages divider */}
                  {isFirstUnread && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="h-px bg-red-500 flex-1" />
                      <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                        Unread Messages
                      </div>
                      <div className="h-px bg-red-500 flex-1" />
                    </div>
                  )}
                  
                  {/* Message */}
                  <div
                    className={cn(
                      "flex items-start gap-2",
                      message.isOwn && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[70%]",
                        message.isOwn && "items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2",
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.content}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.isOwn && getMessageStatus(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="space-y-2 mt-4">
            {typingUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-1 bg-muted rounded-lg px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}