
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Race Cars for Sale</h1>
          
          {/* Modern search and filter bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={20} />
                </div>
                <Input
                  type="text"
                  placeholder="Search by make, model, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-gray-200 bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Expandable filter section */}
            {showFilters && (
              <div className="border-t border-gray-100 pt-5 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      onValueChange={(values) => setPriceRange(values as [number, number])}
                      className="my-6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sort" className="font-medium mb-2 block">Sort By</Label>
                    <Select
                      value={sort}
                      onValueChange={(value) => setSort(value)}
                    >
                      <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Select sorting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="mileage">Lowest Mileage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline"
                      className="mr-2" 
                      onClick={() => {
                        setSearchTerm('');
                        setPriceRange([minPrice, maxPrice]);
                        setSort('newest');
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

          {/* Listings grid with updated card design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedListings.map(car => (
              <Link to={`/car-details/${car.id}`} key={car.id}>
                <Card className="overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img 
                      src={car.image} 
                      alt={car.title} 
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="text-white text-2xl font-bold">
                        ${car.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{car.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{car.location}</span>
                      <span>{car.mileage.toLocaleString()} miles</span>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-black hover:bg-gray-800 text-white" 
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-8">
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([minPrice, maxPrice]);
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
