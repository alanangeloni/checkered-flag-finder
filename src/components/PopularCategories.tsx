import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

type CategoryType = {
  title: string;
  image: string;
  slug: string;
};

const categories: CategoryType[] = [
  {
    title: 'Open Wheel',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    slug: 'open-wheel',
  },
  {
    title: 'Prototype',
    image: 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    slug: 'prototype',
  },
  {
    title: 'GT',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    slug: 'gt',
  },
  {
    title: 'Stock Car',
    image: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    slug: 'stock-car',
  },
  {
    title: 'Touring',
    image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
    slug: 'touring',
  },
  {
    title: 'Rally',
    image: 'https://images.unsplash.com/photo-1521410195597-69c6c46390f9',
    slug: 'rally',
  },
  {
    title: 'Drift',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753',
    slug: 'drift',
  },
  {
    title: 'Drag',
    image: 'https://images.unsplash.com/photo-1529501776267-6b6c6e678089',
    slug: 'drag',
  },
  {
    title: 'Vintage and Classic',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c',
    slug: 'vintage-classic',
  },
  {
    title: 'Production',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d',
    slug: 'production',
  },
];

const CategoryCard = ({ category }: { category: CategoryType }) => {
  return (
    <div className="flex flex-col">
      <Link to={`/category/${category.slug}`} className="block">
        <div className="overflow-hidden rounded-md mb-2">
          <img
            src={category.image}
            alt={`${category.title} race cars for sale - Browse ${category.title} racing vehicles`}
            className="w-full h-24 sm:h-32 object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="font-medium text-xs sm:text-sm">{category.title}</h3>
        <span className="text-xs sm:text-sm text-racecar-red hover:underline">Browse All</span>
      </Link>
    </div>
  );
};

const PopularCategories = () => {
  const isMobile = useIsMobile();
  const displayCount = isMobile ? 6 : categories.length;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 id="popular-categories" className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular Race Car Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.slice(0, displayCount).map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
