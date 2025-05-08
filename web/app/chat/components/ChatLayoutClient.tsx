import { ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChatSidebar } from "@/app/chat/components/ChatSidebar";
import { useSidebar } from '@/app/chat/context/SidebarContext';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatLayoutClientProps {
  children: ReactNode;
}

export function ChatLayoutClient({ children }: ChatLayoutClientProps) {
  const isMobile = useIsMobile()
  const { open, setOpen } = useSidebar();

  return (
    <div className="flex h-full fixed top-0 left-0 w-full">
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[350px] border-r bg-muted/40 backdrop-blur-md">
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden lg:block w-[350px] border-r bg-muted/40 backdrop-blur-md">
          <ChatSidebar />
        </div>
      )}
      
      <main className="flex-1 h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}