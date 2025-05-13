import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Phone,
  Video,
  Info,
  Users,
  Shield,
  Bell,
  BellOff,
  Search,
  Archive,
  Trash2,
  Star,
  Flag,
  Pin,
  Paperclip,
  MessageSquarePlus,
  ImagePlus,
  FileText,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserStatus = "online" | "offline" | "away" | "busy" | "invisible";

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: UserStatus;
}

interface ChatHeaderProps {
  user: User;
  isGroup?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isStarred?: boolean;
  activeUsers?: User[];
  lastActive?: Date;
  typingUsers?: User[];
  totalUnread?: number;
  onCall?: () => void;
  onVideoCall?: () => void;
  onViewInfo?: () => void;
  onMute?: () => void;
  onPin?: () => void;
  onStar?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onSearch?: () => void;
  onAddToGroup?: () => void;
  onManageMembers?: () => void;
  onGroupSettings?: () => void;
}

export function ChatHeader({
  user,
  isGroup = false,
  isPinned = false,
  isMuted = false,
  isStarred = false,
  activeUsers = [],
  lastActive,
  typingUsers = [],
  totalUnread = 0,
  onCall,
  onVideoCall,
  onViewInfo,
  onMute,
  onPin,
  onStar,
  onArchive,
  onDelete,
  onBlock,
  onReport,
  onSearch,
  onAddToGroup,
  onManageMembers,
  onGroupSettings,
}: ChatHeaderProps) {
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState<boolean>(false);
  const [showUserStatus, setShowUserStatus] = useState<boolean>(true);

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-400";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "invisible":
        return "bg-slate-300";
      default:
        return "bg-gray-400";
    }
  };

  const formatLastActive = (date: Date): string => {
    if (!date) return "";
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    
    return date.toLocaleDateString();
  };

  const isUserTyping = typingUsers.length > 0;
  const isMultipleTyping = typingUsers.length > 1;

  return (
    <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 bg-background sm:bg-card">
      <div className="flex items-center justify-between px-3 py-[12.5px]">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {isGroup ? (
              <div className="relative flex -space-x-2">
                {activeUsers.slice(0, 3).map((groupUser, index) => (
                  <Avatar
                    key={groupUser.id}
                    className={`${index > 0 ? "border-2 border-background" : ""} w-8 h-8`}
                  >
                    <AvatarImage src={groupUser.avatar} />
                    <AvatarFallback>
                      {groupUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 3 && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs absolute -bottom-1 -right-1">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {showUserStatus && (
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                      getStatusColor(user.status)
                    )}
                  />
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold line-clamp-1">
                {isGroup ? (user.name || "Group Chat") : user.name}
              </h2>
              {isPinned && (
                <Tooltip>
                  <TooltipTrigger>
                    <Pin className="h-3.5 w-3.5 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>Pinned conversation</TooltipContent>
                </Tooltip>
              )}
              {isStarred && (
                <Tooltip>
                  <TooltipTrigger>
                    <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
                  </TooltipTrigger>
                  <TooltipContent>Starred conversation</TooltipContent>
                </Tooltip>
              )}
              {isMuted && (
                <Tooltip>
                  <TooltipTrigger>
                    <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Notifications muted</TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground max-w-[200px] sm:max-w-[300px] truncate mt-[-5px]">
              {isUserTyping ? (
                <span className="text-primary animate-pulse">
                  {isMultipleTyping
                    ? `${typingUsers.slice(0, 2).map(u => u.name).join(", ")} and ${typingUsers.length - 2} more are typing...`
                    : `${typingUsers[0].name} is typing...`}
                </span>
              ) : isGroup ? (
                `${activeUsers.length} members · ${
                  activeUsers.filter(u => u.status === "online").length
                } online`
              ) : user.status === "online" ? (
                "Online"
              ) : user.status === "busy" ? (
                "Busy"
              ) : user.status === "away" ? (
                "Away"
              ) : lastActive ? (
                `Last active ${formatLastActive(lastActive)}`
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 sm:gap-1">
          {totalUnread > 0 && (
            <Badge variant="destructive" className="mr-1.5">
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => onMute?.()}
                >
                  {isMuted ? (
                    <BellOff className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute notifications" : "Mute notifications"}
              </TooltipContent>
            </Tooltip>
          
            {!isGroup && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => onCall?.()}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice call</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => onVideoCall?.()}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video call</TooltipContent>
                </Tooltip>
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={searchActive ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => {
                    setSearchActive(!searchActive);
                    onSearch?.();
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search in conversation</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setMediaGalleryOpen(true)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Media & files</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onViewInfo?.()}>
                  <Info className="h-4 w-4 mr-2" />
                  View info
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onStar?.()}>
                  <Star className={cn(
                    "h-4 w-4 mr-2",
                    isStarred && "text-amber-500 fill-amber-500"
                  )} />
                  {isStarred ? "Unstar" : "Star conversation"}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onPin?.()}>
                  <Pin className={cn(
                    "h-4 w-4 mr-2",
                    isPinned && "text-primary"
                  )} />
                  {isPinned ? "Unpin" : "Pin conversation"}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {isGroup ? (
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onAddToGroup?.()}>
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      Add people
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => onManageMembers?.()}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage members
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => onGroupSettings?.()}>
                      <Shield className="h-4 w-4 mr-2" />
                      Group settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onAddToGroup?.()}>
                      <Users className="h-4 w-4 mr-2" />
                      Create group with {user.name}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => onArchive?.()}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive chat
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => onBlock?.()} 
                  className="text-red-500"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Block {isGroup ? "group" : "user"}
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onReport?.()} 
                  className="text-red-500"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report {isGroup ? "group" : "user"}
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onDelete?.()} 
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
      
      {searchActive && (
        <div className="p-2 border-t bg-accent/30 flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-[13px] h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in conversation..."
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-[9px] h-6 p-1 text-xs"
              onClick={() => setSearchActive(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <Dialog open={mediaGalleryOpen} onOpenChange={setMediaGalleryOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Media & Files</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
              <ImagePlus className="h-6 w-6 mb-2" />
              <span>Photos & Videos</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span>Documents</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
              <Link className="h-6 w-6 mb-2" />
              <span>Links</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Link(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}