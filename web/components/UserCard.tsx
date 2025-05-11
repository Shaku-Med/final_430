import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, UserPlus, MessageCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'b';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

interface UserCardProps {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  isFollowing?: boolean;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  showMessageButton?: boolean;
}

export function UserCard({
  id,
  name,
  firstName,
  lastName,
  avatar,
  bio,
  followers = 0,
  isFollowing = false,
  onFollow,
  onMessage,
  showMessageButton = false,
}: UserCardProps) {
  const [following, setFollowing] = useState(isFollowing);

  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous';
  const avatarFallback = name ? name.slice(0, 2).toUpperCase() : 
    (firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'A');

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.(id);
  };

  const handleMessage = () => {
    onMessage?.(id);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={displayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 w-fit">
          <Link className=" w-fit max-w-fit" href={`/dashboard/profile/${id}`}>
            <h3 className="font-semibold text-lg w-fit hover:underline hover:text-primary">{displayName}</h3>
          </Link>
          <Link href={`/dashboard/profile/${id}/followers`}>
             <p className="text-sm text-muted-foreground hover:underline hover:text-primary">{formatNumber(followers)} {followers <= 1 ? 'follower' : 'followers'}</p>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {bio && <p className="text-sm mb-4">{bio}</p>}
        <div className="flex gap-2">
          <Button
            variant={following ? "default" : "outline"}
            size="sm"
            onClick={handleFollow}
            className="flex-1"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {following ? "Following" : "Follow"}
          </Button>
          {showMessageButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessage}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 