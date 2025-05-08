"use client";

import { UserCard } from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

// Mock data - replace with actual API calls
const users = [
  {
    id: "1",
    name: "John Doe",
    avatar: "/avatars/john.jpg",
    bio: "Software Engineer | Tech Enthusiast",
    followers: 1234,
    isFollowing: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "/avatars/jane.jpg",
    bio: "UX Designer | Creative Mind",
    followers: 856,
    isFollowing: true,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    bio: "Data Scientist | AI Researcher",
    followers: 2345,
    isFollowing: false,
  },
  // Add more mock users as needed
];

export default function PeoplePage() {
  const handleFollow = (userId: string) => {
    // Implement follow logic
    console.log("Follow user:", userId);
  };

  const handleLike = (userId: string) => {
    // Implement like logic
    console.log("Like user:", userId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">People</h1>
        <Link href="/dashboard/people/friends">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Friends
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search people..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.id}
            {...user}
            onFollow={handleFollow}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  );
} 