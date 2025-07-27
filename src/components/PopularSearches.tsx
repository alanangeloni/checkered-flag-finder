
import React from 'react';

const searches = [
  "Formula 1 Cars", "GT Racing Cars", "Rally Cars", "Prototype Race Cars", 
  "Stock Cars", "Touring Cars", "Drag Racing Cars", "Drift Cars",
  "Vintage Race Cars", "Classic Race Cars", "Open Wheel Cars", "Sports Cars",
  "Track Day Cars", "Endurance Race Cars", "Sprint Cars"
];

const PopularSearches = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 id="popular-searches" className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular Race Car Searches</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {searches.map((search, idx) => (
          <a 
            key={idx} 
            href={`/listings?search=${encodeURIComponent(search)}`}
            className="text-gray-600 hover:text-racecar-red hover:underline text-sm sm:text-base truncate"
            title={`Search for ${search} for sale`}
          >
            {search}
          </a>
        ))}
      </div>
    </div>
  );
};

export default PopularSearches;
