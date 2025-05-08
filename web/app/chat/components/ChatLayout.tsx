"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { ChatLayoutClient } from "./ChatLayoutClient";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <ChatLayoutClient>{children}</ChatLayoutClient>
    </SidebarProvider>
  );
}