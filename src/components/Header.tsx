import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RacecarLogo from './RacecarLogo';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Menu, Search, UserRound, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!error && profile) {
          setIsAdmin(profile.is_admin);
        }
      }
    };
    checkUser();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!error && profile) {
          setIsAdmin(profile.is_admin);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      console.error("Sign out error:", error);
    }
  };

  const MobileNav = () => <Sheet>
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
                    {categories.map(category => <Link key={category.title} to={category.href} className="text-sm text-gray-700 hover:text-racecar-red">
                        {category.title}
                      </Link>)}
                  </div>
                </div>
                <Link to="/blog" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                  Blog
                </Link>
              </nav>
              
              <div className="mt-6 pt-6 border-t">
                {user ? <div className="flex flex-col space-y-2">
                    <Link to="/profile" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Profile
                    </Link>
                    <Link to="/my-listings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      My Listings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin-dashboard" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/settings" className="px-2 py-2 hover:bg-gray-100 rounded-md">
                      Settings
                    </Link>
                    <button onClick={handleSignOut} className="px-2 py-2 text-left hover:bg-gray-100 rounded-md text-red-600">
                      Sign Out
                    </button>
                  </div> : <div className="flex flex-col space-y-3">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/list-car">
                      <Button className="w-full bg-racecar-red hover:bg-red-700">List Your Car</Button>
                    </Link>
                  </div>}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>;

  return <header className="bg-white py-4 sm:px-6 border-b border-gray-200 px-0">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-8">
            <RacecarLogo />
            
            {!isMobile && <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/listings">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Listings
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[320px] gap-2 p-2 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        {categories.map(category => <li key={category.title} className="row-span-3">
                            <Link to={category.href} className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 no-underline outline-none focus:shadow-md">
                              <div className="mb-1 mt-2 text-sm font-medium">
                                {category.title}
                              </div>
                              <p className="text-xs leading-tight text-muted-foreground">
                                {category.description}
                              </p>
                            </Link>
                          </li>)}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/blog">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Blog
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isMobile && <MobileNav />}
            
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:block">Search</span>
            </Button>
            
            {user ? <>
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
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings" className="w-full cursor-pointer">My Listings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard" className="w-full cursor-pointer">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/list-car" className="hidden sm:block">
                  <Button size="sm" className="bg-racecar-red hover:bg-red-700">List Your Car</Button>
                </Link>
              </>}
          </div>
        </div>
      </div>
    </header>;
};

// Updated categories list for the dropdown
const categories = [{
  title: "Open Wheel",
  description: "Single-seater, open-wheel racing cars including F1, F2, F3, and IndyCar",
  href: "/category/open-wheel"
}, {
  title: "Prototype",
  description: "Purpose-built race cars for endurance events like Le Mans and WEC",
  href: "/category/prototype"
}, {
  title: "GT",
  description: "Grand touring cars built for both performance and comfort on long-distance races",
  href: "/category/gt"
}, {
  title: "Stock Car",
  description: "Modified production-based vehicles used in NASCAR and similar series",
  href: "/category/stock-car"
}, {
  title: "Touring",
  description: "Production-based race cars used in touring car racing championships",
  href: "/category/touring"
}, {
  title: "Rally",
  description: "Modified production cars designed for off-road racing across varied terrains",
  href: "/category/rally"
}, {
  title: "Drift",
  description: "Vehicles specially modified for the motorsport of drifting",
  href: "/category/drift"
}, {
  title: "Drag",
  description: "Straight-line acceleration vehicles built for maximum speed over short distances",
  href: "/category/drag"
}, {
  title: "Vintage and Classic",
  description: "Historic racing vehicles from motorsport's golden eras",
  href: "/category/vintage-classic"
}, {
  title: "Production",
  description: "Lightly modified production cars for entry-level racing",
  href: "/category/production"
}];
export default Header;
