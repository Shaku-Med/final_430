import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, UserPlus } from "lucide-react";
import { useState } from "react";

interface UserCardProps {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  followers: number;
  isFollowing?: boolean;
  onFollow?: (userId: string) => void;
  onLike?: (userId: string) => void;
}

export function UserCard({
  id,
  name,
  avatar,
  bio,
  followers,
  isFollowing = false,
  onFollow,
  onLike,
}: UserCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [liked, setLiked] = useState(false);

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.(id);
  };

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(id);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{followers} followers</p>
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
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 