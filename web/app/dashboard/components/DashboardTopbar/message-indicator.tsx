'use client'

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageIndicatorProps {
  count?: number;
}

export const MessageIndicator: React.FC<MessageIndicatorProps> = ({ count = 0 }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <MessageSquare className="h-4 w-4" />
            {count > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
              >
                {count}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Messages</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};