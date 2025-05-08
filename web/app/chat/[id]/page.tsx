"use client";

import { useState } from "react";
import { ChatHeader } from "@/app/chat/components/ChatHeader";
import { ChatBody } from "@/app/chat/components/ChatBody";
import { ChatFooter } from "@/app/chat/components/ChatFooter";
import { mockMessages, mockUsers, currentUser } from "../data/mockData";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState(mockMessages[conversationId] || []);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const otherUser = mockUsers.find((user) => user.id === conversationId);

  const handleSendMessage = (content: string, attachments?: File[]) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender: currentUser,
      timestamp: new Date(),
      status: "sending" as const,
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        )
      );
    }, 2000);
  };

  if (!otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader
        user={otherUser}
        isGroup={otherUser.isGroup}
        onCall={() => {}}
        onVideoCall={() => {}}
        onViewInfo={() => {}}
        onMute={() => setIsMuted(!isMuted)}
        isMuted={isMuted}
      />
      <ChatBody messages={messages} typingUsers={isTyping ? [otherUser] : []} currentUserId={currentUser.id} />
      <ChatFooter
        onSendMessage={handleSendMessage}
        onTyping={setIsTyping}
      />
    </div>
  );
} 