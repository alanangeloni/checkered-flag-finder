
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user: User | null;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, isAdmin, onSignOut }) => {
  if (!user) {
    return (
      <>
        <Link to="/login" className="hidden sm:block">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
        <Link to="/list-car" className="hidden sm:block">
          <Button size="sm" className="bg-racecar-red hover:bg-red-700">List Your Car</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/list-car" className="hidden sm:block">
        <Button size="sm" className="bg-racecar-red hover:bg-red-700">List Your Car</Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0">
            <Avatar>
              <AvatarFallback>
                {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="hidden md:block">
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="w-full cursor-pointer">Admin Dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/my-listings" className="w-full cursor-pointer">My Listings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserMenu;
