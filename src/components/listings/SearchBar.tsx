
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categories: {id: string, name: string}[];
  selectedCategory: string;
  handleCategoryChange: (categoryId: string) => void;
  availableSubcategories: {id: string, name: string}[];
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategoryId: string) => void;
  sort: string;
  setSort: (sortOption: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  handleCategoryChange,
  availableSubcategories,
  selectedSubcategory,
  setSelectedSubcategory,
  sort,
  setSort,
  showFilters,
  setShowFilters,
}) => {
  return (
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
            disabled={selectedCategory === "all" || availableSubcategories.length === 0}
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

          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)} 
            className="border-0 text-racecar-red bg-white"
          >
            <Filter size={18} className="mr-2" />
            More Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
