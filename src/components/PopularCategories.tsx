import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

type CategoryType = {
  title: string;
  image: string;
  slug: string;
};

import { supabase } from '@/integrations/supabase/client';

// No more staticCategories: categories are now fetched from DB

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x150?text=No+Image';

const CategoryCard = ({ category }: { category: CategoryType }) => {
  // Always display a valid image: DB > static > placeholder
  const imgSrc = category.image && category.image.trim() !== '' ? category.image : PLACEHOLDER_IMAGE;
  
  // Debug the image URL
  console.log(`Category: ${category.title}, Image URL: ${imgSrc}`);
  
  return (
    <div className="flex flex-col">
      <Link to={`/category/${category.slug}`} className="block">
        <div className="overflow-hidden rounded-md mb-2 bg-gray-100" style={{minHeight: '120px'}}>
          <img
            src={imgSrc}
            alt={category.title}
            className="w-full h-32 sm:h-40 object-cover transform hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.error(`Failed to load image for ${category.title}: ${imgSrc}`);
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
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
  const [categories, setCategories] = React.useState<CategoryType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      // Use the exact URLs provided by the user with correct storage path and capitalization
      const staticCategoriesFromDB = [
        { id: '2673c03e-cd46-4a8a-a5b8-d2ace0cfbae3', name: 'Open Wheel', slug: 'open-wheel', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Open%20Wheel.png' },
        { id: '7a7b28e5-e3e3-424e-b34e-c7d66e093bad', name: 'Prototype', slug: 'prototype', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Prototype.png' },
        { id: '122de1f4-4cd1-4f5e-aad8-8f676d9853e2', name: 'GT', slug: 'gt', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//GT.png' },
        { id: 'e180d978-594b-482e-a95b-a06a76610f10', name: 'Touring', slug: 'touring', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Touring.png' },
        { id: '335be339-9592-486e-bc1e-bf82387d6be3', name: 'Stock Car', slug: 'stock-car', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Stock%20Car.png' },
        { id: '26682f4b-d37e-473c-9cff-b27c788314dd', name: 'Rally', slug: 'rally', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Rally.png' },
        { id: '435dba0c-4703-430d-bc93-51086b587ffa', name: 'Drift', slug: 'drift', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Drift.png' },
        { id: 'b0ab91b8-d14e-4d01-915b-427d0e1c214a', name: 'Drag', slug: 'drag', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Drag.png' },
        { id: '0c453bc9-e2ed-4394-8d1b-9b05622664d8', name: 'Vintage and Classic', slug: 'vintage-and-classic', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Vintage%20and%20Classic.png' },
        { id: 'f2e3f44a-5b2e-492f-ac18-950f8143aaf1', name: 'Production', slug: 'production', image_url: 'https://vxkzrgsseeiuamimxiih.supabase.co/storage/v1/object/public/car_images//Production.png' }
      ];

      // Skip the database query and use the hardcoded data
      setCategories(staticCategoriesFromDB.map(cat => ({
        title: cat.name,
        slug: cat.slug,
        image: cat.image_url
      })));
      
      // Log what we're doing
      console.log('Using hardcoded categories with images');
      setLoading(false);
      return; // Skip the rest of the function

      // This part won't run, but keeping it for reference
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug');
      console.log('Categories fetch result:', { data, error });
      // This code won't run because we return early above
      // Keeping it for reference
      if (error) {
        setError('Failed to load categories: ' + error.message);
        setCategories([]);
      } else if (data) {
        // Just map all categories, we'll use the static images
        setCategories(
          data.map((cat: any) => ({
            title: cat.name || cat.slug,
            slug: cat.slug,
            image: '', // No image from DB
          }))
        );
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const displayCount = isMobile ? 6 : categories.length;

  if (loading) {
    return <div className="container mx-auto px-4 py-6">Loading categories...</div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-6 text-red-600">{error}</div>;
  }

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
