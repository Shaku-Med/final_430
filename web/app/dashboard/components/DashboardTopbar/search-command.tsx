'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Lock, Users, FileText, Calendar, Video, CheckSquare, FolderGit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { getQuickActions } from './data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'team' | 'document' | 'task' | 'video' | 'event' | 'user';
  description?: string;
  score: number;
  metadata?: {
    tags?: string[];
    status?: string;
    privacy?: string;
  };
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
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickActions, setQuickActions] = useState(getQuickActions());

  useEffect(() => {
    setQuickActions(getQuickActions());
  }, []);

  // No keyboard shortcuts

  const getSearchShortcut = () => {
    return 'Ctrl+K';
  };

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
        router.push(`/projects/${item.id}`);
        break;
      case 'team':
        router.push(`/team/${item.id}`);
        break;
      case 'document':
        router.push(`/documents/${item.id}`);
        break;
      case 'task':
        router.push(`/tasks/${item.id}`);
        break;
      case 'video':
        router.push(`/videos/${item.id}`);
        break;
      case 'event':
        router.push(`/events/${item.id}`);
        break;
      case 'user':
        router.push(`/profile/${item.id}`);
        break;
      default:
        router.push(`/${item.type}/${item.id}`);
    }
  };

  const handleQuickActionSelect = (route: string) => {
    setIsCommandOpen(false);
    router.push(route);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project':
        return <FolderGit2 className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPrivacyIcon = (privacy?: string) => {
    if (!privacy) return null;
    return privacy === 'private' ? (
      <Lock className="h-3 w-3 text-muted-foreground" />
    ) : privacy === 'team' ? (
      <Users className="h-3 w-3 text-muted-foreground" />
    ) : null;
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
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
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
                <CommandItem 
                  key={action.name} 
                  className="flex items-center justify-between"
                  onSelect={() => handleQuickActionSelect(action.route)}
                >
                  <div className="flex items-center">
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.length > 0 && Object.keys(resultGroups).map((groupType, index) => (
            <React.Fragment key={groupType}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={groupType.charAt(0).toUpperCase() + groupType.slice(1) + 's'}>
                {resultGroups[groupType].map(item => (
                  <CommandItem 
                    key={item.id} 
                    onSelect={() => handleItemSelect(item)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center flex-1">
                        {getTypeIcon(item.type)}
                        <span className="ml-2 font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.metadata?.privacy && getPrivacyIcon(item.metadata.privacy)}
                        {item.metadata?.status && (
                          <Badge variant="secondary" className="text-xs">
                            {item.metadata.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        {item.description}
                      </p>
                    )}
                    {item.metadata?.tags && item.metadata.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 ml-6">
                        {item.metadata.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};