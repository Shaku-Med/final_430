'use client'

import React from 'react';
import { TopbarLogo } from './logo';
import { SearchCommand } from './search-command';
import { MessageIndicator } from './message-indicator';
import { ProfileMenu } from './profile-menu';
import { useIsMobile } from '../../hooks/use-mobile';
import { NotificationsDropdown } from './notification';
import { SidebarProvider, SidebarTrigger } from '../app-sidebar';

const Topbar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <nav className="border-b px-4 flex items-center justify-center w-full py-[.35rem] sticky top-0 z-50 backdrop-blur-md bg-card">
      <div className=" w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
            <>
              <SidebarProvider>
                <SidebarTrigger/>
              </SidebarProvider>
            </>
          
          <TopbarLogo />
        </div>


        <div className="flex items-center gap-1">
          <SearchCommand isMobile={isMobile} />

          <NotificationsDropdown />

          <MessageIndicator count={3} />
                    
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Topbar;