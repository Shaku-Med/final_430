import React, { useLayoutEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User, Settings, LogOut, Settings2 } from "lucide-react"
import Link from 'next/link'
import SignOff from '@/app/Home/Nav/SignOff'

interface ProfileDropDownProps {
    Topbar?: boolean;
}

interface UserProfile {
    name: string;
    email: string;
    profile: string;
    user_id: string;
    firstname: string;
    lastname: string;
}

const ProfileDropDown = ({Topbar}: ProfileDropDownProps) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useLayoutEffect(() => {
        const profile = (window as any)._profile;
        if (profile) {
            try {
                const parsedProfile = typeof profile === 'string' ? JSON.parse(profile) : profile;
                setUserProfile(parsedProfile);
            } catch (error) {
                console.error('Error parsing profile data:', error);
            }
        }
    }, []);
    
    if (!userProfile) {
        return null;
    }

    return (
        <div className="flex items-center gap-3">
            {
                !Topbar && (
                    <>
                        <Avatar>
                            <AvatarImage src={userProfile.profile} alt={userProfile.name || userProfile.firstname + " " + userProfile.lastname} />
                            <AvatarFallback>{(userProfile.name || userProfile.firstname + " " + userProfile.lastname).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <Link href={`/dashboard/profile/${userProfile?.user_id}`} className="text-sm font-medium truncate hover:text-primary hover:underline">
                                {userProfile.name || userProfile.firstname + " " + userProfile.lastname}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                                Welcome back, {userProfile.name || userProfile.firstname + " " + userProfile.lastname}
                            </p>
                        </div>
                    
                    </>
                )
            }
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {
                        Topbar ? (
                            <Avatar>
                                <AvatarImage src={userProfile.profile} alt={userProfile.name || userProfile.firstname + " " + userProfile.lastname} />
                                <AvatarFallback>{(userProfile.name || userProfile.firstname + " " + userProfile.lastname).charAt(0)}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        )
                    }
                </DropdownMenuTrigger>
                <DropdownMenuContent className=' z-[10000000000] min-w-[200px]' align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`/dashboard/profile/${userProfile?.user_id}`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href={`/dashboard/account/settings`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`/dashboard/settings`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                        <Settings2 className="h-4 w-4" />
                        <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                    {/* <Link href={`/dashboard/account/settings`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer h-10">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                        </DropdownMenuItem>
                    </Link> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={e => {
                    if(window.confirm('Are you sure you want to log out?')){
                        SignOff()
                        setTimeout(() => {
                        window.location.reload()
                        }, 2000)
                    }
                    }} className="gap-2 cursor-pointer text-red-600 focus:text-red-600 h-10">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default ProfileDropDown
