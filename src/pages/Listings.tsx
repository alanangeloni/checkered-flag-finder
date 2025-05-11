import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/listings/SearchBar';
import FilterBar from '@/components/listings/FilterBar';
import ListingGrid from '@/components/listings/ListingGrid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initial price range values
const MIN_PRICE = 100000;
const MAX_PRICE = 300000;

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

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  
  // State for database data
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{[key: string]: {id: string, name: string}[]}>({}); 
  const [listings, setListings] = useState(mockListings);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSubcategories, setAvailableSubcategories] = useState<{id: string, name: string}[]>([]);

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

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSort('newest');
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setAvailableSubcategories(subcategories.all || []);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            availableSubcategories={availableSubcategories}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            sort={sort}
            setSort={setSort}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          
          {showFilters && (
            <FilterBar 
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minPrice={MIN_PRICE}
              maxPrice={MAX_PRICE}
              resetFilters={resetFilters}
            />
          )}

          {/* Show loading state or listings */}
          <ListingGrid 
            isLoading={isLoading}
            listings={sortedListings}
            filteredListings={filteredListings}
            resetFilters={resetFilters}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
