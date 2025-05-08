
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Filter, Search, ChevronDown } from 'lucide-react';

// Mock data for demonstration
const mockListings = [
  {
    id: 1,
    title: "2021 Ferrari 488 GTB",
    price: 299000,
    location: "Miami, FL",
    mileage: 3500,
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae"
  },
  {
    id: 2, 
    title: "2022 Porsche 911 GT3",
    price: 189000,
    location: "Los Angeles, CA",
    mileage: 1200,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
  },
  {
    id: 3,
    title: "2020 Lamborghini Huracán",
    price: 275000,
    location: "Las Vegas, NV",
    mileage: 5200,
    image: "https://images.unsplash.com/photo-1514867644123-6385d58d3cd4"
  },
  {
    id: 4,
    title: "2019 McLaren 720S",
    price: 245000,
    location: "New York, NY",
    mileage: 8900,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b"
  },
  {
    id: 5,
    title: "2023 Aston Martin Vantage",
    price: 178000,
    location: "Chicago, IL",
    mileage: 650,
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753"
  },
  {
    id: 6,
    title: "2018 Nissan GT-R Nismo",
    price: 135000,
    location: "Seattle, WA",
    mileage: 12500,
    image: "public/lovable-uploads/0142baeb-373b-448f-9a23-a1d1bc774af9.png"
  }
];

// Price format helper
const formatPrice = (price: number) => {
  return `$${price.toLocaleString()}`;
};

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([100000, 300000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('newest');

  // Min and max prices from data
  const minPrice = 100000;
  const maxPrice = 300000;

  // Filter listings based on search and price range
  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    
    return matchesSearch && matchesPrice;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'mileage') return a.mileage - b.mileage;
    // Default: newest
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Race Car Listings</h1>
          
          {/* Search and filter bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by model, make, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Expandable filter section */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="price-range" className="block mb-2">
                      Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </Label>
                    <Slider
                      id="price-range"
                      defaultValue={[priceRange[0], priceRange[1]]}
                      min={minPrice}
                      max={maxPrice}
                      step={5000}
                      onValueChange={(values) => setPriceRange(values as [number, number])}
                      className="my-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sort" className="block mb-2">Sort By</Label>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full rounded-md border border-input p-2"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="mileage">Lowest Mileage</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button className="mr-2" onClick={() => {
                      setSearchTerm('');
                      setPriceRange([minPrice, maxPrice]);
                      setSort('newest');
                    }}>
                      Reset All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listings grid with new card design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings.map(car => (
              <Card key={car.id} className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={car.image} 
                    alt={car.title} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 px-4 py-2 text-white text-xl font-bold">
                    ${car.price.toLocaleString()}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">{car.title}</h3>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>{car.location}</span>
                    <span>{car.mileage.toLocaleString()} miles</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-black hover:bg-gray-800 text-white" 
                    size="lg"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
