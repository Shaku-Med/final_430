'use client'
import React, { useState } from 'react'
import { ChatHeader } from '../../components/ChatHeader'
import { ChatBody } from '../../components/ChatBody'
import { ChatFooter } from '../../components/ChatFooter'
import { User, Message } from '../../components/ChatComponents/chat'

const Chat = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Mock data - replace with actual data fetching
  const currentUser: User = {
    id: 'current-user-id',
    name: 'Current User',
    status: 'online',
    isGroup: false
  };

  const otherUser: User = {
    id: 'other-user-id',
    name: 'Other User',
    status: 'online',
    isGroup: false
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: currentUser,
      timestamp: new Date(),
      status: 'sending',
      isOwn: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <>
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
    </>
  )
}

export default Chat
