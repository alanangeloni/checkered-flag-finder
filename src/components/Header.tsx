
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RacecarLogo from './RacecarLogo';
import MobileNav from './header/MobileNav';
import DesktopNav from './header/DesktopNav';
import UserMenu from './header/UserMenu';
import { useAuth } from './header/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white py-4 sm:px-6 border-b border-gray-200 px-0">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-8">
            <RacecarLogo />
            
            {!isMobile && <DesktopNav isAdmin={isAdmin} />}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isMobile && <MobileNav isAdmin={isAdmin} user={user} onSignOut={signOut} />}
            
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:block">Search</span>
            </Button>
            
            <UserMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
