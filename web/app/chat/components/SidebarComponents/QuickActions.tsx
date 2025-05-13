"use client";

import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  Star, 
  Archive, 
  Clock, 
  Pin 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JSX, useState } from "react";

type FilterType = "all" | "starred" | "pinned" | "recent" | "archived";

interface FilterItem {
  id: FilterType;
  label: string;
  icon: React.ElementType;
}

export function QuickActions(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filters: FilterItem[] = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "starred", label: "Starred", icon: Star },
    { id: "pinned", label: "Pinned", icon: Pin },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "archived", label: "Archived", icon: Archive }
  ];

  return (
    <div className="px-1 py-2 border-t border-b">
      <div className="flex items-center justify-between gap-1 px-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <Button
              key={filter.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-1 hover:bg-accent rounded-lg flex-1",
                activeFilter === filter.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              onClick={() => setActiveFilter(filter.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{filter.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}