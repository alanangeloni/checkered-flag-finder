
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

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  
  // State for database data
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<{[key: string]: CategoryItem[]}>({}); 
  const [listings, setListings] = useState<CarListing[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [availableSubcategories, setAvailableSubcategories] = useState<CategoryItem[]>([]);

  // Min and max prices from data - will be updated based on actual data
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);

  // Helper function to retry database operations with exponential backoff
  const retryOperation = async <T,>(operation: () => Promise<T>, name: string, maxRetries = 3): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${name}: Attempt ${attempt}/${maxRetries}`);
        const result = await operation();
        console.log(`${name}: Operation successful`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`${name}: Attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          console.log(`${name}: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  // Fetch listings, categories and subcategories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching listings data...');
        
        // Fetch all categories with retry mechanism
        const categoriesData = await retryOperation<any[]>(async () => {
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
        
        console.log('Categories fetched successfully:', categoriesData.length);
        
        // Add "All Categories" option
        const allCategories: CategoryItem[] = [{id: 'all', name: 'All Categories'}, ...categoriesData.map(cat => ({
          id: cat.id as string,
          name: cat.name as string
        }))];
        setCategories(allCategories);
        
        // Fetch subcategories for each category
        const subcategoriesData = await retryOperation<any[]>(async () => {
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
        
        console.log('Subcategories fetched successfully:', subcategoriesData.length);
        
        // Group subcategories by category_id
        const subcategoryMap: {[key: string]: CategoryItem[]} = {
          all: [{id: 'all', name: 'All Subcategories'}],
        };
        
        if (categoriesData) {
          categoriesData.forEach((category: any) => {
            subcategoryMap[category.id] = [{id: 'all', name: 'All Subcategories'}];
          });
        }
        
        if (subcategoriesData) {
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
        }
        
        setSubcategories(subcategoryMap);
        setAvailableSubcategories(subcategoryMap.all || []);
        
        console.log('Fetching car listings...');
        
        // Fetch car listings with all required data
        let rawListingsData = [];
        try {
          console.log('Fetching listings...');
          const { data, error } = await supabase
            .from('car_listings')
            .select(`
              *,
              car_images (id, image_url, is_primary),
              category:categories (name),
              subcategory:subcategories (name)
            `)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching listings:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log('Successfully fetched listings:', data.length);
            rawListingsData = data;
          } else {
            console.warn('No listings found');
          }
        } catch (fetchError) {
          console.error('Critical error fetching listings:', fetchError);
          toast.error('Error loading listings. Please refresh the page.');
        }
        
        console.log('Listings fetched successfully:', rawListingsData.length);
        
        // Process the listings data to match our CarListing interface
        const processedListings: CarListing[] = rawListingsData.map(listing => {
          // Get primary image from the car_images array
          const primaryImage = listing.car_images?.find(img => img.is_primary)?.image_url;
          
          // Get category and subcategory names from the joined data
          const categoryName = listing.category?.name || '';
          const subcategoryName = listing.subcategory?.name || '';
          
          return {
            id: listing.id,
            name: listing.name || 'Unnamed Listing',
            make: listing.make,
            model: listing.model,
            year: listing.year,
            price: Number(listing.price) || 0,
            location: listing.location,
            short_description: listing.short_description,
            status: listing.status || 'active',
            category_id: listing.category_id,
            subcategory_id: listing.subcategory_id,
            category_name: categoryName,
            subcategory_name: subcategoryName,
            slug: listing.slug || listing.id,
            created_at: listing.created_at,
            primary_image: primaryImage || listing.primary_image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80',
            mileage: listing.mileage
          };
        });
        
        // Find min and max prices from the data
        if (processedListings.length > 0) {
          const prices = processedListings.map(listing => listing.price).filter(price => !isNaN(price));
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange([min, max]);
          }
        }
        
        setListings(processedListings);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to load listings: ${error.message || 'Please try again later.'}`);
        
        // Even if we fail, set empty arrays to prevent UI from being stuck in loading state
        setListings([]);
        setCategories([{id: 'all', name: 'All Categories'}]);
        setSubcategories({all: [{id: 'all', name: 'All Subcategories'}]});
        setAvailableSubcategories([{id: 'all', name: 'All Subcategories'}]);
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
    
    // For public visibility, show all listings regardless of status
    // This is a change to make car listings visible to everyone
    // const statusMatch = car.status === 'active';
    const statusMatch = true;
    
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
    
    return statusMatch && searchMatch && priceMatch && categoryMatch && subcategoryMatch;
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
