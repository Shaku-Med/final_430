"use client";

import { UserCard } from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

// Mock data - replace with actual API calls
const friends = [
  {
    id: "2",
    name: "Jane Smith",
    avatar: "/avatars/jane.jpg",
    bio: "UX Designer | Creative Mind",
    followers: 856,
    isFollowing: true,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    avatar: "/avatars/sarah.jpg",
    bio: "Product Manager | Tech Lead",
    followers: 567,
    isFollowing: true,
  },
  {
    id: "5",
    name: "Alex Brown",
    avatar: "/avatars/alex.jpg",
    bio: "Full Stack Developer | Open Source Contributor",
    followers: 1234,
    isFollowing: true,
  },
  // Add more mock friends as needed
];

export default function FriendsPage() {
  const handleFollow = (userId: string) => {
    // Implement unfollow logic
    console.log("Unfollow user:", userId);
  };

  const handleLike = (userId: string) => {
    // Implement like logic
    console.log("Like user:", userId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Friends</h1>
        <Link href="/dashboard/people">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All People
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search friends..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <UserCard
            key={friend.id}
            {...friend}
            onFollow={handleFollow}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  );
} 