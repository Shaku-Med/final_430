"use client";

import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  Settings, 
  Menu 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/app/Home/Icons/Logo";

export function SidebarHeader(): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="p-3 flex items-center justify-between border-b bg-card">
      <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Logo pathClassName="fill-foreground" svgClassName="h-10 w-10" />
            <h1 className="text-lg font-semibold">Chats</h1>
          </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Plus className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}