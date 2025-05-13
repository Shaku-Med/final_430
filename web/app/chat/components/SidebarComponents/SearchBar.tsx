"use client";

import { useState, useEffect, Dispatch, SetStateAction, JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Clock, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  toggleFilters: () => void;
  filterCount: number;
}

export function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  toggleFilters, 
  filterCount 
}: SearchBarProps): JSX.Element {
  const [showSearchHistory, setShowSearchHistory] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "project update", 
    "meeting notes", 
    "design feedback"
  ]);
  const [focused, setFocused] = useState<boolean>(false);

  const handleClearSearch = (): void => {
    setSearchQuery("");
  };

  const handleSearchHistoryClick = (query: string): void => {
    setSearchQuery(query);
    setShowSearchHistory(false);
  };

  const handleDeleteFromHistory = (e: React.MouseEvent, query: string): void => {
    e.stopPropagation();
    setSearchHistory(searchHistory.filter(item => item !== query));
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          
          <Input
            placeholder="Search conversations..."
            className="pl-9 pr-8 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (searchHistory.length > 0) {
                setShowSearchHistory(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setFocused(false);
                setShowSearchHistory(false);
              }, 200);
            }}
          />
          
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 relative ${filterCount > 0 ? "text-primary border-primary" : ""}`}
          onClick={toggleFilters}
        >
          <Filter className="h-4 w-4" />
          {filterCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {showSearchHistory && searchHistory.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-background rounded-md border shadow-md max-h-60 overflow-y-auto">
          <div className="p-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Recent searches</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setSearchHistory([])}
            >
              Clear all
            </Button>
          </div>
          
          <ul className="py-1">
            {searchHistory.map((query, i) => (
              <li
                key={i}
                className="px-3 py-1.5 hover:bg-accent flex items-center justify-between cursor-pointer"
                onClick={() => handleSearchHistoryClick(query)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{query}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-background/50"
                  onClick={(e) => handleDeleteFromHistory(e, query)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}