
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type CategoryType = {
  title: string;
  image: string;
};

const categories: CategoryType[] = [
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
  },
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
  },
];

const CategoryCard = ({ category }: { category: CategoryType }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-md mb-2">
        <img
          src={category.image}
          alt={category.title}
          className="w-full h-24 sm:h-32 object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="font-medium text-xs sm:text-sm">{category.title}</h3>
      <a href="#" className="text-xs sm:text-sm text-racecar-red hover:underline">Browse All</a>
    </div>
  );
};

const PopularCategories = () => {
  const isMobile = useIsMobile();
  const displayCount = isMobile ? 6 : 10;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.slice(0, displayCount).map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
