
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

// Enable this for debugging
const DEBUG = true;

// Supabase storage URL for car images
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "car_images";
if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL environment variable. Please set VITE_SUPABASE_URL in your .env file.');
}

// Define interfaces for better type safety
interface CategoryItem {
  id: string;
  name: string;
}

interface SubcategoryItem {
  id: string;
  name: string;
}

interface CarImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  car_listing_id: string;
}

interface CarListing {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  price: number;
  location?: string;
  short_description?: string;
  status: string;
  category_id?: string;
  subcategory_id?: string;
  category_name?: string;
  subcategory_name?: string;
  slug?: string;
  created_at: string;
  primary_image?: string;
  images?: CarImage[];
  mileage?: number;
}

// Define a type for the raw listing data from Supabase
interface RawListing {
  id: string;
  name?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  location?: string;
  short_description?: string;
  status?: string;
  category_id?: string;
  subcategory_id?: string;
  slug?: string;
  created_at: string;
  primary_image?: string;
  mileage?: number;
  images?: RawCarImage[];
  [key: string]: any; // Allow for additional properties
}

// Define a type for raw car image data from Supabase
interface RawCarImage {
  id: string;
  image_url: string;
  is_primary?: boolean;
  car_listing_id: string;
  [key: string]: any; // Allow for additional properties
}

import { useLocation } from 'react-router-dom';

const Listings = () => {
  const location = useLocation();
  // Helper to get query param
  function getSearchParam() {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  }
  const [searchTerm, setSearchTerm] = useState(getSearchParam());

  // Update search term if URL changes
  useEffect(() => {
    setSearchTerm(getSearchParam());
  }, [location.search]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  
  // State for database data
  const [categories, setCategories] = useState<CategoryItem[]>([{id: 'all', name: 'All Categories'}]);
  const [subcategories, setSubcategories] = useState<{[key: string]: CategoryItem[]}>({all: [{id: 'all', name: 'All Subcategories'}]});
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSubcategories, setAvailableSubcategories] = useState<CategoryItem[]>([{id: 'all', name: 'All Subcategories'}]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Min and max prices from data - will be updated based on actual data
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);

  // Simple fetch function with basic error handling
  const simpleFetch = async <T,>(operation: () => Promise<T>, name: string): Promise<T> => {
    try {
      if (DEBUG) console.log(`${name}: Starting...`);
      const result = await operation();
      if (DEBUG) console.log(`${name}: Successful`);
      return result;
    } catch (error) {
      console.error(`${name}: Failed:`, error);
      throw error;
    }
  };

  // Fetch listings, categories and subcategories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        if (DEBUG) console.log('Fetching listings data...');
        
        // Fetch all categories with simple fetch
        const categoriesData = await simpleFetch<any[]>(async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
          
          if (error) {
            console.error('Error fetching categories:', error);
            return [];
          }
          return data || [];
        }, 'Categories Fetch');
        
        if (DEBUG) console.log('Categories fetched successfully:', categoriesData.length);
        
        // Add "All Categories" option
        const allCategories = [
          { id: 'all', name: 'All Categories' },
          ...categoriesData
        ];
        setCategories(allCategories);
        
        // Fetch subcategories for each category
        const subcategoriesMap: {[key: string]: CategoryItem[]} = {
          all: [{ id: 'all', name: 'All Subcategories' }]
        };
        
        // Fetch all subcategories in one request
        const subcategoriesData = await simpleFetch<any[]>(async () => {
          const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .order('name');
          
          if (error) {
            console.error('Error fetching subcategories:', error);
            return [];
          }
          
          return data || [];
        }, 'Subcategories Fetch');
        
        if (DEBUG) console.log('Subcategories fetched successfully:', subcategoriesData.length);
        
        // Group subcategories by category_id
        subcategoriesData.forEach(sub => {
          const categoryId = sub.category_id;
          if (!subcategoriesMap[categoryId]) {
            subcategoriesMap[categoryId] = [{ id: 'all', name: 'All Subcategories' }];
          }
          subcategoriesMap[categoryId].push(sub);
        });
        
        setSubcategories(subcategoriesMap);
        setAvailableSubcategories(subcategoriesMap.all || [{ id: 'all', name: 'All Subcategories' }]);
        
        if (DEBUG) console.log('Fetching car listings...');
        
        // Fetch car listings with images
        const listingsData = await simpleFetch<RawListing[]>(async () => {
          // First get the listings with all related data
          const { data: listings, error } = await supabase
            .from('car_listings')
            .select(`
              *,
              car_images(*)
            `)
            .order('created_at', { ascending: false });
          if (DEBUG) console.log('RAW LISTINGS FROM SUPABASE:', listings);
          
          if (error) {
            console.error('Error fetching car listings:', error);
            throw error;
          }
          
          if (DEBUG) console.log(`Successfully fetched ${listings?.length || 0} car listings with images`);
          
          // Process each listing to set the correct image URLs
          if (listings && listings.length > 0) {
            listings.forEach((listing: any) => {
              if (listing.car_images && listing.car_images.length > 0) {
                if (DEBUG) console.log(`Listing ${listing.id} has ${listing.car_images.length} images`);
                
                // Find primary image first
                const primaryImage = listing.car_images.find((img: any) => img.is_primary === true);
                
                if (primaryImage) {
                  // Use the primary image
                  if (DEBUG) console.log(`Using primary image for listing ${listing.id}:`, primaryImage.image_url);
                  
                  // Handle both relative and absolute URLs
                  if (primaryImage.image_url.startsWith('http')) {
                    listing.primary_image = primaryImage.image_url;
                  } else {
                    // Construct the full Supabase storage URL
                    listing.primary_image = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${primaryImage.image_url}`;
                  }
                } else {
                  // Use the first image if no primary image is marked
                  const firstImage = listing.car_images[0];
                  if (DEBUG) console.log(`Using first image for listing ${listing.id}:`, firstImage.image_url);
                  
                  // Handle both relative and absolute URLs
                  if (firstImage.image_url.startsWith('http')) {
                    listing.primary_image = firstImage.image_url;
                  } else {
                    // Construct the full Supabase storage URL
                    listing.primary_image = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${firstImage.image_url}`;
                  }
                }
              } else {
                // No images found, use a default image
                listing.primary_image = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80';
                if (DEBUG) console.log(`No images found for listing ${listing.id}, using default image`);
              }
            });
          }
          
          return listings || [];
        }, 'Car Listings Fetch');
        
        if (DEBUG) console.log('Listings fetched successfully:', listingsData.length);
        
        // Process the listings data to match our CarListing interface
        // Simplified to avoid complex joins
        const processedListings: CarListing[] = listingsData.map(listing => {
          return {
            id: listing.id,
            name: listing.name || listing.id || 'Race Car',
            make: listing.make,
            model: listing.model,
            year: listing.year,
            price: listing.price || 0,
            location: listing.location,
            short_description: listing.short_description || listing.detailed_description || '',
            status: listing.status || 'active',
            category_id: listing.category_id,
            subcategory_id: listing.subcategory_id,
            category_name: '',  // We'll fetch these separately if needed
            subcategory_name: '',
            slug: listing.slug || listing.id,
            created_at: listing.created_at,
            primary_image: listing.primary_image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80',
            mileage: listing.mileage
          };
        });
        
        // Calculate min and max prices from actual data
        if (processedListings.length > 0) {
          const prices = processedListings.map(car => car.price).filter(price => typeof price === 'number');
          if (prices.length > 0) {
            const minDataPrice = Math.min(...prices);
            const maxDataPrice = Math.max(...prices);
            setMinPrice(minDataPrice);
            setMaxPrice(maxDataPrice);
            setPriceRange([minDataPrice, maxDataPrice]);
          }
        }
        
        setListings(processedListings);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setLoadError(error.message || 'Failed to load listings');
        // Set empty data to prevent UI from being stuck
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter and sort listings based on user selections
  const filteredListings = listings.filter(car => {
    // Skip listings without essential data
    if (!car || !car.id) return false;
    
    // Filter by search term
    const searchMatch = searchTerm === '' || 
      car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by price range
    const priceMatch = car.price >= priceRange[0] && car.price <= priceRange[1];
    
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || car.category_id === selectedCategory;
    
    // Filter by subcategory - only apply if a category is selected
    const subcategoryMatch = selectedSubcategory === 'all' || 
      (selectedCategory !== 'all' && car.subcategory_id === selectedSubcategory);
    
    return searchMatch && priceMatch && categoryMatch && subcategoryMatch;
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
    console.log('Category changed to:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all');
    
    // Update available subcategories based on selected category
    if (categoryId === 'all') {
      setAvailableSubcategories(subcategories.all || []);
    } else {
      const categorySubcategories = subcategories[categoryId] || [];
      console.log('Available subcategories for category', categoryId, ':', categorySubcategories);
      setAvailableSubcategories(categorySubcategories);
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
          {loadError && (
            <div className="text-center py-8 bg-red-50 rounded-lg shadow-sm mb-6">
              <h3 className="text-xl font-medium mb-2 text-red-700">Error Loading Listings</h3>
              <p className="text-red-600 mb-4">{loadError}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Refresh Page
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-lg border-0 shadow">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedListings.length > 0 ? (
                sortedListings.map(car => {
                  // Skip invalid listings
                  if (!car || !car.id) return null;
                  
                  // Handle missing images gracefully
                  const fallbackImage = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80';
                  const imageUrl = car.primary_image || fallbackImage;
                  
                  return (
                    <Link to={`/car-details/${car.id}/${car.slug || ''}`} key={car.id}>
                      <Card className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow h-full border-0 shadow">
                        <div className="relative">
                          <img 
                            src={imageUrl} 
                            alt={car.name || 'Race car listing'} 
                            className="w-full h-48 object-cover" 
                            onError={(e) => {
                              // Fallback image if the original fails to load
                              (e.target as HTMLImageElement).src = fallbackImage;
                            }}
                          />
                          <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-4 py-1 m-3 rounded">
                            ${car.price.toLocaleString()}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-bold">{car.name}</h3>
                          <div className="text-xs text-gray-600 mt-1">
                            {[car.make, car.model, car.year].filter(Boolean).join(' • ') || 'Details not available'}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {car.category_name && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {car.category_name}
                              </span>
                            )}
                            {car.subcategory_name && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {car.subcategory_name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            {car.location || 'Location not specified'}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-16 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium mb-2">No listings available</h3>
                  <p className="text-gray-500">Check back soon for new race car listings</p>
                </div>
              )}
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
