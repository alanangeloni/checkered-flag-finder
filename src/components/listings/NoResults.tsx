
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoResultsProps {
  resetFilters: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ resetFilters }) => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-8">
      <h3 className="text-xl font-medium mb-2">No listings found</h3>
      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      <Button className="mt-4" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

export default NoResults;
