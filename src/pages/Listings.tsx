
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Filter, Search } from 'lucide-react';

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
    image: "https://images.unsplash.com/photo-1581362508255-e4e11f5caee3"
  }
];

const Listings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Filter listings based on search and price range
  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMinPrice = priceRange.min === '' || listing.price >= Number(priceRange.min);
    const matchesMaxPrice = priceRange.max === '' || listing.price <= Number(priceRange.max);
    
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Race Car Listings</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Search by model, make, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min-price">Minimum Price ($)</Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-price">Maximum Price ($)</Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                  {/* More filter options could be added here */}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2" onClick={() => {
                  setSearchTerm('');
                  setPriceRange({ min: '', max: '' });
                }}>
                  Reset
                </Button>
                <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
              </CardFooter>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(car => (
              <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{car.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-racecar-red">${car.price.toLocaleString()}</p>
                  <div className="flex justify-between items-center mt-2 text-gray-500">
                    <span>{car.location}</span>
                    <span>{car.mileage.toLocaleString()} miles</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white">View Details</Button>
                </CardFooter>
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
