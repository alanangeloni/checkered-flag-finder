
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import RacecarLogo from '../RacecarLogo';
import { categories } from './headerData';

interface MobileNavProps {
  isAdmin: boolean;
  user: any;
  onSignOut: () => Promise<void>;
}

const MobileNav: React.FC<MobileNavProps> = ({ isAdmin, user, onSignOut }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <RacecarLogo />
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
          </div>
          
          <ScrollArea className="flex-1 h-[calc(100vh-65px)]">
            <div className="p-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                  Home
                </Link>
                <Link to="/listings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                  Listings
                </Link>
                <div className="px-2 py-2">
                  <div className="font-medium mb-2">Categories</div>
                  <div className="ml-4 flex flex-col space-y-2">
                    {categories.map(category => (
                      <Link 
                        key={category.title} 
                        to={category.href} 
                        className="text-sm text-gray-700 hover:text-racecar-red"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link to="/blog" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                  Blog
                </Link>
              </nav>
              
              <div className="mt-6 pt-6 border-t">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link to="/profile" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Profile
                    </Link>
                    <Link to="/my-listings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      My Listings
                    </Link>
                    <Link to="/settings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Settings
                    </Link>
                    <button 
                      onClick={onSignOut} 
                      className="px-2 py-2 text-left hover:bg-gray-100 rounded-md text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/list-car">
                      <Button className="w-full bg-racecar-red hover:bg-red-700">List Your Car</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
