
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface FilterBarProps {
  priceRange: [number, number];
  setPriceRange: (values: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
  resetFilters: () => void;
}

// Price format helper
const formatPrice = (price: number) => {
  return `$${price.toLocaleString()}`;
};

const FilterBar: React.FC<FilterBarProps> = ({
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  resetFilters
}) => {
  return (
    <div className="bg-white p-5 rounded-b-xl shadow-lg mb-8">
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
          <Button variant="outline" className="mr-2" onClick={resetFilters}>
            Reset All
          </Button>
          <Button>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
