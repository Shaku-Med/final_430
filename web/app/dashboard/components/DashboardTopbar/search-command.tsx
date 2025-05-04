'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
} from "@/components/ui/command";
import { quickActions } from './data';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'team' | 'document' | 'other';
}

interface SearchCommandProps {
  className?: string;
  isMobile?: boolean;
  apiEndpoint?: string;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({ 
  className, 
  isMobile = false,
  apiEndpoint = '/api/search' 
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [os, setOs] = useState<'windows' | 'mac' | 'linux' | 'other'>('other');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      if (userAgent.indexOf('win') !== -1) return 'windows';
      if (userAgent.indexOf('mac') !== -1) return 'mac';
      if (userAgent.indexOf('linux') !== -1) return 'linux';
      return 'other';
    };
    
    setOs(detectOS());
  }, []);

  const getShortcutSymbol = (shortcut: string) => {
    if (os === 'mac') {
      return shortcut.replace('Ctrl', '⌘')
                     .replace('Alt', '⌥')
                     .replace('Shift', '⇧');
    }
    return shortcut;
  };

  const getSearchShortcut = () => {
    return os === 'mac' ? '⌘K' : 'Ctrl+K';
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (os === 'mac' ? e.metaKey : e.ctrlKey)) && !e.shiftKey) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [os]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiEndpoint}?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchSearchResults, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, apiEndpoint]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleItemSelect = (item: SearchResult) => {
    setIsCommandOpen(false);
    
    switch (item.type) {
      case 'project':
        window.location.href = `/projects/${item.id}`;
        break;
      case 'team':
        window.location.href = `/team/${item.id}`;
        break;
      case 'document':
        window.location.href = `/documents/${item.id}`;
        break;
      default:
        window.location.href = `/${item.type}/${item.id}`;
    }
  };

  const groupResultsByType = () => {
    const groups: Record<string, SearchResult[]> = {};
    
    searchResults.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    
    return groups;
  };

  const resultGroups = groupResultsByType();

  return (
    <>
      {!isMobile && (
        <div className={`hidden md:flex flex-1 ${className}`}>
          <Button 
            variant="outline" 
            className="w-full justify-between text-muted-foreground border-dashed gap-1"
            onClick={() => setIsCommandOpen(true)}
          >
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Search...
            </div>
            <kbd className="bg-muted px-2 py-0.5 text-xs rounded hidden sm:inline-block">
              {getSearchShortcut()}
            </kbd>
          </Button>
        </div>
      )}

      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsCommandOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
      )}

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={searchQuery}
          onValueChange={handleSearchChange}
        />
        <CommandList>
          {isLoading && <Loader2 className='animate-spin'/>}
          
          {error && (
            <CommandEmpty className="text-red-500">
              Error: {error}
            </CommandEmpty>
          )}
          
          {!isLoading && searchQuery && searchResults.length === 0 && !error && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {(!searchQuery || searchQuery.length < 2) && (
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem key={action.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.name}</span>
                  </div>
                  <kbd className="bg-muted px-2 py-0.5 text-xs rounded">
                    {getShortcutSymbol(action.shortcut)}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.length > 0 && Object.keys(resultGroups).map(groupType => (
            <CommandGroup heading={groupType.charAt(0).toUpperCase() + groupType.slice(1) + 's'} key={groupType}>
              {resultGroups[groupType].map(item => (
                <CommandItem 
                  key={item.id} 
                  onSelect={() => handleItemSelect(item)}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};