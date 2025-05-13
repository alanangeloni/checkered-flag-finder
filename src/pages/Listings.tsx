
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
import { CarListingWithImages } from '@/types/customTypes';

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  
  // State for database data
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{[key: string]: {id: string, name: string}[]}>({}); 
  const [listings, setListings] = useState<CarListingWithImages[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [availableSubcategories, setAvailableSubcategories] = useState<{id: string, name: string}[]>([]);

  // Min and max prices from data - will be updated based on actual data
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);

  // Fetch listings, categories and subcategories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
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
        
        // Fetch car listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        if (listingsError) throw listingsError;
        
        // Process the data
        const formattedListings = listingsData.map((listing: any) => ({
          ...listing,
          primary_image: listing.images && listing.images.length > 0 
            ? listing.images.find((img: any) => img.is_primary)?.image_url || listing.images[0].image_url
            : null
        }));
        
        setListings(formattedListings);
        
        // Calculate price range from actual listings
        if (formattedListings.length > 0) {
          const prices = formattedListings.map(listing => Number(listing.price));
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load listings');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter listings based on search, price range, category, and subcategory
  const filteredListings = listings.filter(listing => {
    const searchFields = [
      listing.name, 
      listing.make, 
      listing.model, 
      listing.location,
      listing.short_description
    ].filter(Boolean).map(field => field.toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
                          searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    
    const price = Number(listing.price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    const matchesCategory = selectedCategory === "all" || listing.category_id === selectedCategory;
    const matchesSubcategory = selectedSubcategory === "all" || listing.subcategory_id === selectedSubcategory;
    
    return matchesSearch && matchesPrice && matchesCategory && matchesSubcategory;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sort === 'price-low') return Number(a.price) - Number(b.price);
    if (sort === 'price-high') return Number(b.price) - Number(a.price);
    if (sort === 'mileage') {
      const mileageA = a.mileage || Number.MAX_SAFE_INTEGER;
      const mileageB = b.mileage || Number.MAX_SAFE_INTEGER;
      return mileageA - mileageB;
    }
    // Default: newest
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
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
  
  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-lg border-0 shadow">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 animate-pulse mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Listings grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedListings.map(car => {
                const imageUrl = car.primary_image || 
                              (car.images && car.images.length > 0 ? 
                               car.images[0].image_url : 
                               'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5');
                
                return (
                  <Link to={`/car-details/${car.id}/${car.slug || ''}`} key={car.id}>
                    <Card className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow h-full border-0 shadow">
                      <div className="relative">
                        <img 
                          src={imageUrl} 
                          alt={car.name} 
                          className="w-full h-48 object-cover" 
                        />
                        <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-4 py-1 m-3 rounded">
                          ${Number(car.price).toLocaleString()}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold">{car.name}</h3>
                        <div className="text-xs text-gray-600 mt-1">
                          {[car.make, car.model, car.year].filter(Boolean).join(' • ')}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          {car.location || 'Location not specified'}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
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
