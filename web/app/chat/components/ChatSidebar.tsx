"use client";

import { JSX, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, X, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { UserList } from "./UserList";
import { FilterPanel } from "./SidebarComponents/FilterPanel";
import { SidebarHeader } from "./SidebarComponents/SidebarHeader";
import { SearchBar } from "./SidebarComponents/SearchBar";
import { QuickActions } from "./SidebarComponents/QuickActions";

export interface FilterState {
  unread: boolean;
  recent: boolean;
  favorites: boolean;
  archived?: boolean;
  shared?: boolean;
  date: string | null;
}

export function ChatSidebar(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    unread: false,
    recent: false,
    favorites: false,
    date: null
  });

  const toggleFilters = (): void => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filterName: keyof FilterState, value: any): void => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = (): void => {
    setActiveFilters({
      unread: false,
      recent: false,
      favorites: false,
      date: null
    });
  };

  const filterCount = Object.values(activeFilters).filter(v => 
    v !== false && v !== null
  ).length;

  return (
    <div className="h-full flex flex-col justify-between w-full bg-background ">
      <SidebarHeader />
      
      <div className="p-3 space-y-3">
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          toggleFilters={toggleFilters}
          filterCount={filterCount}
        />
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <FilterPanel 
                activeFilters={activeFilters} 
                handleFilterChange={handleFilterChange}
                resetFilters={resetFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuickActions />
      
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <UserList 
          searchQuery={searchQuery}
          filters={activeFilters}
        />
      </div>
    </div>
  );
}