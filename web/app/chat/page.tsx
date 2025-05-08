'use client'
import { MessageCircleDashed, MessageSquare } from "lucide-react";
import Logo from "../Home/Icons/Logo";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "./context/SidebarContext";

export default function DefaultChatPage() {
  let ismobile = useIsMobile()
  const {setOpen, open} = useSidebar()
  // 
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center space-y-4 relative">
        <Logo pathClassName="fill-muted-foreground" svgClassName="h-50 w-50 mx-auto " />
        <MessageCircleDashed size={30} className=" absolute top-10 right-[60px] text-muted-foreground"/>
        <h2 className="text-2xl font-semibold">CSI SPOTLIGHT CHATS</h2>
        <p className="text-muted-foreground">
         Choose a chat and start chatting
        </p>
        <p className="text-muted-foreground">End-To-End Encrypted</p>
        {
          ismobile && (
            <Button onClick={() => setOpen(!open)} variant={`outline`}>
              {open ? "Close Chat" : "Choose a chat"}
            </Button>
          )
        }
      </div>
    </div>
  );
}
