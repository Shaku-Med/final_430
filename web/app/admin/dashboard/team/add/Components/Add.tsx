"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from "sonner";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface User {
  user_id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
  bio: string;
  isFollowing: boolean;
  isBlocked: boolean;
}

interface AddProps {
  users: User[];
  total: number;
  currentPage: number;
  search: string;
}

const Add: React.FC<AddProps> = ({ users, total, currentPage, search }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const [inputValue, setInputValue] = useState(search);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleAddUser = async (userId: string) => {
    try {
      const response = await fetch('/api/team/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user to team');
      }

      const { message } = await response.json();
      toast.success(message);
      
      router.refresh();
    } catch (error) {
      console.error('Error adding user to team:', error);
      toast.error('Failed to add user to team');
    }
  };
  
  const openTokenDialog = (user: User) => {
    setSelectedUser(user);
    setGeneratedToken(null);
    setIsDialogOpen(true);
  };
  
  const generateUserToken = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/user/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: selectedUser.user_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setGeneratedToken(data.token);
      toast.success('Token generated successfully');
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate token');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    if (search) {
      params.set('search', search);
    }
    router.push(`?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, 800);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Add Team Members</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={inputValue}
            onChange={handleSearch}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card
            key={user.user_id}
            className="rounded-lg shadow-md p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4 justify-between w-full text-center">
              {user.profile && (
                <div className="relative h-12 w-12">
                  <Image
                    src={user.profile || '/default-avatar.png'}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div className='flex flex-col w-full items-center justify-center'>
                <h3 className="font-semibold text-2xl">{user.name || user.firstname + ' ' + user.lastname}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => openTokenDialog(user)}
              className="p-2"
              title="Create Token"
            >
              <PlusCircle className="h-6 w-6" />
              <span>Create User Token</span>
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md z-[10000000] overflow-y-auto rounded-none max-h-full w-full border-none">
          <DialogHeader>
            <DialogTitle>Generate User Token</DialogTitle>
            <DialogDescription>
              {selectedUser && `Create token for ${selectedUser.name || selectedUser.firstname + ' ' + selectedUser.lastname}`}
            </DialogDescription>
          </DialogHeader>

          {
            generatedToken && (
                <>
                    <DialogDescription className=' text-sm text-blue-400 py-4 border-t border-b bg-muted px-2'>
                        Copy this token and share with the user you added. 
                        <br/>
                        The token will expire in 24 hours.
                        <br/>
                        The user will be able to use the token to create a team member account.
                    </DialogDescription>
                    <DialogDescription className=' text-sm text-blue-400 py-4 border-t border-b bg-muted px-2'>
                        Your selected user should be logged in to the account selected to be able to use this token.
                    </DialogDescription>
                
                </>
            )
          }
          
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            {!generatedToken ? (
              <Button 
                onClick={generateUserToken} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Token'
                )}
              </Button>
            ) : (
              <div className="w-full space-y-4">
                <div className="p-3 rounded-md break-all accessibility">
                  <p className="text-sm font-mono">{window?.location?.origin}/teams/new/?id={generatedToken}</p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window?.location?.origin}/teams/new/?id=${generatedToken}`);
                    toast.success('Token copied to clipboard');
                  }}
                  className="w-full"
                >
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Add;