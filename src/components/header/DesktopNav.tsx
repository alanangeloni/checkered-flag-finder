
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger, 
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu';
import { categories } from './headerData';

interface DesktopNavProps {
  isAdmin: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ isAdmin }) => {
  return (
    <NavigationMenu className="hidden md:flex">
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
              {categories.map(category => (
                <li key={category.title} className="row-span-3">
                  <Link 
                    to={category.href} 
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 no-underline outline-none focus:shadow-md"
                  >
                    <div className="mb-1 mt-2 text-sm font-medium">
                      {category.title}
                    </div>
                    <p className="text-xs leading-tight text-muted-foreground">
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
        {isAdmin && (
          <NavigationMenuItem>
            <Link to="/admin">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default DesktopNav;
