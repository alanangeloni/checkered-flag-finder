
import React from 'react';

const searches = Array(15).fill("Formula 1");

const PopularSearches = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Popular Race Car Searches</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {searches.map((search, idx) => (
          <a 
            key={idx} 
            href="#" 
            className="text-gray-600 hover:text-racecar-red hover:underline"
          >
            {search}
          </a>
        ))}
      </div>
    </div>
  );
};

export default PopularSearches;
