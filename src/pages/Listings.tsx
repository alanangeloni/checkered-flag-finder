
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock data for demonstration while we fetch real data
const mockListings = [{
  id: 1,
  title: "2021 Ferrari 488 GTB",
  price: 299000,
  location: "Miami, FL",
  mileage: 3500,
  image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae",
  category: "Sport",
  subcategory: "Luxury"
}, {
  id: 2,
  title: "2022 Porsche 911 GT3",
  price: 189000,
  location: "Los Angeles, CA",
  mileage: 1200,
  image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  category: "Sport",
  subcategory: "Performance"
}, {
  id: 3,
  title: "2020 Lamborghini Huracán",
  price: 275000,
  location: "Las Vegas, NV",
  mileage: 5200,
  image: "https://images.unsplash.com/photo-1514867644123-6385d58d3cd4",
  category: "Sport",
  subcategory: "Luxury"
}, {
  id: 4,
  title: "2019 McLaren 720S",
  price: 245000,
  location: "New York, NY",
  mileage: 8900,
  image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b",
  category: "Sport",
  subcategory: "Supercar"
}, {
  id: 5,
  title: "2023 Aston Martin Vantage",
  price: 178000,
  location: "Chicago, IL",
  mileage: 650,
  image: "https://images.unsplash.com/photo-1542362567-b07e54358753",
  category: "Sport",
  subcategory: "Luxury"
}, {
  id: 6,
  title: "2018 Nissan GT-R Nismo",
  price: 135000,
  location: "Seattle, WA",
  mileage: 12500,
  image: "public/lovable-uploads/0142baeb-373b-448f-9a23-a1d1bc774af9.png",
  category: "Sport",
  subcategory: "Performance"
}];

// Price format helper
const formatPrice = (price: number) => {
  return `$${price.toLocaleString()}`;
};

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([100000, 300000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  
  // State for database data
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{[key: string]: {id: string, name: string}[]}>({}); 
  const [listings, setListings] = useState(mockListings); // Start with mock data
  const [isLoading, setIsLoading] = useState(true);
  const [availableSubcategories, setAvailableSubcategories] = useState<{id: string, name: string}[]>([]);

  // Min and max prices from data
  const minPrice = 100000;
  const maxPrice = 300000;

  // Fetch categories and subcategories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        
        // Add "All Categories" option
        const allCategories = [{id: 'all', name: 'All Categories'}, ...categoriesData];
        setCategories(allCategories);
        
        // Fetch all subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) throw subcategoriesError;
        
        // Group subcategories by category_id
        const subcategoryMap: {[key: string]: {id: string, name: string}[]} = {
          all: [{id: 'all', name: 'All Subcategories'}],
        };
        
        categoriesData.forEach((category: any) => {
          subcategoryMap[category.id] = [{id: 'all', name: 'All Subcategories'}];
        });
        
        subcategoriesData.forEach((sub: any) => {
          if (subcategoryMap[sub.category_id]) {
            subcategoryMap[sub.category_id].push({
              id: sub.id,
              name: sub.name
            });
          } else {
            subcategoryMap[sub.category_id] = [{id: 'all', name: 'All Subcategories'}, {
              id: sub.id,
              name: sub.name
            }];
          }
        });
        
        setSubcategories(subcategoryMap);
        setAvailableSubcategories(subcategoryMap.all || []);
        
        // Later we would fetch actual car listings here
        // For now we'll continue using the mock data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Filter listings based on search, price range, category, and subcategory
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (listing.location && listing.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === "all" || listing.subcategory === selectedSubcategory;
    return matchesSearch && matchesPrice && matchesCategory && matchesSubcategory;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'mileage') return a.mileage - b.mileage;
    // Default: newest
    return b.id - a.id;
  });

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all");
    
    // Update available subcategories based on the selected category
    if (subcategories[categoryId]) {
      setAvailableSubcategories(subcategories[categoryId]);
    } else {
      setAvailableSubcategories(subcategories.all || []);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          
          {/* Search and filter bar with solid background */}
          <div className="rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-black p-6 text-white">
              <h2 className="font-bold text-center mb-2 text-4xl">Race Cars for Sale</h2>
              <p className="text-center mb-6">Browse our exclusive collection of high-performance vehicles</p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-white/20 border-0 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedSubcategory} 
                  onValueChange={setSelectedSubcategory}
                  disabled={selectedCategory === "all" || isLoading || availableSubcategories.length === 0}
                >
                  <SelectTrigger className="bg-white/20 border-0 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-white/70" size={18} />
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Search by make, model, or location..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10 bg-white/20 border-0 text-white placeholder:text-white/70" 
                  />
                </div>

                <Select value={sort} onValueChange={value => setSort(value)}>
                  <SelectTrigger className="bg-white/20 border-0 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="mileage">Lowest Mileage</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-0 text-racecar-red bg-white">
                  <Filter size={18} className="mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Expandable filter section */}
            {showFilters && (
              <div className="bg-white p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price-range" className="font-medium mb-2 block">
                      Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </Label>
                    <Slider 
                      id="price-range" 
                      defaultValue={[priceRange[0], priceRange[1]]} 
                      min={minPrice} 
                      max={maxPrice} 
                      step={5000} 
                      onValueChange={values => setPriceRange(values as [number, number])} 
                      className="my-6" 
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <Button 
                      variant="outline" 
                      className="mr-2" 
                      onClick={() => {
                        setSearchTerm('');
                        setPriceRange([minPrice, maxPrice]);
                        setSort('newest');
                        setSelectedCategory("all");
                        setSelectedSubcategory("all");
                        setAvailableSubcategories(subcategories.all || []);
                      }}
                    >
                      Reset All
                    </Button>
                    <Button>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Show loading state */}
          {isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500">Loading car listings...</p>
            </div>
          )}

          {/* Listings grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedListings.map(car => (
                <Link to={`/car-details/${car.id}`} key={car.id}>
                  <Card className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow h-full border-0 shadow">
                    <div className="relative">
                      <img 
                        src={car.image} 
                        alt={car.title} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-4 py-1 m-3 rounded">
                        ${car.price.toLocaleString()}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold">{car.title}</h3>
                      <div className="text-xs text-gray-600 mt-1">
                        Race Car Details, Race Car Details, Race Car Details
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        {car.location}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filteredListings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-8">
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([minPrice, maxPrice]);
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setAvailableSubcategories(subcategories.all || []);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
