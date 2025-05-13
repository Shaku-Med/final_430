"use client";

import { UserCard } from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/app/hooks/useDebounce";
import { toast } from "sonner";
import { useState } from "react";

interface User {
  user_id: string;
  name: string;
  firstname: string;
  lastname: string;
  profile: string;
  bio: string;
  isFollowing: boolean;
  isBlocked: boolean;
  followerCount: number;
  isFriend: boolean;
}

export default function PeoplePage({ 
  users, 
  total, 
  currentPage, 
  searchQuery: initialSearchQuery 
}: { 
  users: User[];
  total: number;
  currentPage: number;
  searchQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.set('page', '1'); // Reset to first page on new search
    router.replace(`/dashboard/people?${params.toString()}`);
  };

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }

      const { isFollowing, message } = await response.json();
      
      // Update the user's following status in the UI
      const updatedUsers = users.map(user => 
        user.user_id === userId 
          ? { ...user, isFollowing } 
          : user
      );

      toast.success(message);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast.error('Failed to follow/unfollow user');
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      const response = await fetch('/api/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to block/unblock user');
      }

      const { isBlocked, message } = await response.json();
      
      // Remove the blocked user from the list
      const updatedUsers = users.filter(user => user.user_id !== userId);

      toast.success(message);
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('Failed to block/unblock user');
    }
  };

  const handleMessage = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">People</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/people/requests">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Follow Requests
            </Button>
          </Link>
          <Link href="/dashboard/people/friends">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Friends
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Find people..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.user_id}
            id={user.user_id}
            name={user.name}
            firstName={user.firstname}
            lastName={user.lastname}
            avatar={user.profile}
            bio={user.bio}
            followers={user.followerCount}
            isFollowing={user.isFollowing}
            onFollow={handleFollow}
            onMessage={handleMessage}
            showMessageButton={user.isFriend}
          />
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your search criteria.
        </div>
      )}
    </div>
  );
} 