
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RacecarLogo from './RacecarLogo';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Search, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-white py-4 px-6 border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <RacecarLogo />
            
            <NavigationMenu>
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
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((category) => (
                        <li key={category.title} className="row-span-3">
                          <Link
                            to={category.href}
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {category.title}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {category.description}
                            </p>
                          </Link>
                        </li>
                      ))}
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
            </NavigationMenu>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            
            {user ? (
              <>
                <Link to="/list-car">
                  <Button size="sm" className="bg-racecar-red hover:bg-red-700">List Your Car</Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                      <Avatar>
                        <AvatarFallback>
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings" className="w-full cursor-pointer">My Listings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/list-car">
                  <Button size="sm" className="bg-racecar-red hover:bg-red-700">List Your Car</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Expanded categories list for the dropdown
const categories = [
  {
    title: "Formula Racing",
    description: "Single-seater, open-wheel racing cars including F1, F2, F3, and IndyCar",
    href: "/category/formula",
  },
  {
    title: "Sports Cars",
    description: "High-performance road cars designed for speed and exhilarating driving experiences",
    href: "/category/sports-cars",
  },
  {
    title: "GT Cars",
    description: "Grand touring cars built for both performance and comfort on long-distance drives",
    href: "/category/gt-cars",
  },
  {
    title: "Rally Cars",
    description: "Modified production cars designed for off-road racing across varied terrains",
    href: "/category/rally",
  },
  {
    title: "Touring Cars",
    description: "Production-based race cars used in touring car racing championships",
    href: "/category/touring",
  },
  {
    title: "Prototype Racing",
    description: "Purpose-built race cars for endurance events like Le Mans and WEC",
    href: "/category/prototype",
  },
  {
    title: "Historic Racing",
    description: "Classic and vintage race cars from motorsport's golden eras",
    href: "/category/historic",
  },
  {
    title: "Drift Cars",
    description: "Vehicles specially modified for the motorsport of drifting",
    href: "/category/drift",
  },
  {
    title: "Off-Road Racing",
    description: "Extreme vehicles for desert, baja, and all-terrain competitions",
    href: "/category/off-road",
  },
  {
    title: "Karting",
    description: "Entry-level racing with small, open, four-wheeled vehicles",
    href: "/category/karting",
  },
];

export default Header;
