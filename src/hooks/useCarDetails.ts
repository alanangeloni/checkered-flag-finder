
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CarListingWithImages } from '@/types/customTypes';

// Mock data to use as fallback for demo purposes
const mockCarListings = {
  1: {
    id: "mock-1",
    name: "2021 Ferrari 488 GTB",
    short_description: "Pristine racing condition, track ready",
    detailed_description: "This Ferrari 488 GTB is in pristine racing condition and ready for the track. Built with the finest Italian engineering, this supercar delivers an unmatched racing experience.",
    price: 299000,
    race_car_type: "GT",
    seller_type: "Dealer",
    created_at: "2025-05-01T00:00:00Z",
    make: "Ferrari",
    model: "488 GTB",
    year: 2021,
    mileage: 3500,
    location: "Miami, FL",
    engine_specs: "3.9L Twin-Turbocharged V8",
    transmission: "7-Speed Dual-Clutch",
    drivetrain: "RWD",
    weight: "3,252 lbs",
    suspension: "Electronic adaptive dampers",
    brakes: "Carbon ceramic",
    safety_equipment: "Roll cage, fire suppression system",
    images: [
      { image_url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae" }
    ],
    category_name: "Sport",
    subcategory_name: "Luxury"
  },
  2: {
    id: "mock-2",
    name: "2022 Porsche 911 GT3",
    short_description: "Race-tuned perfection",
    detailed_description: "The 911 GT3 represents the pinnacle of Porsche's racing technology for the street. This meticulously maintained example is ready for both track days and weekend drives.",
    price: 189000,
    race_car_type: "GT3",
    seller_type: "Private",
    created_at: "2025-04-15T00:00:00Z",
    make: "Porsche",
    model: "911 GT3",
    year: 2022,
    mileage: 1200,
    location: "Los Angeles, CA",
    engine_specs: "4.0L Naturally Aspirated Flat-6",
    transmission: "6-Speed Manual",
    drivetrain: "RWD",
    weight: "3,126 lbs",
    suspension: "Track-focused suspension",
    brakes: "Porsche Ceramic Composite Brakes",
    safety_equipment: "Half cage, fire extinguisher",
    images: [
      { image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70" }
    ],
    category_name: "Sport",
    subcategory_name: "Performance"
  },
  3: {
    id: "mock-3",
    name: "2020 Lamborghini Huracán",
    short_description: "Track-focused Italian supercar",
    detailed_description: "This Lamborghini Huracán has been professionally modified for track use while maintaining street legality. A perfect blend of Italian style and racing performance.",
    price: 275000,
    race_car_type: "Time Attack",
    seller_type: "Dealer",
    created_at: "2025-03-22T00:00:00Z",
    make: "Lamborghini",
    model: "Huracán",
    year: 2020,
    mileage: 5200,
    location: "Las Vegas, NV",
    engine_specs: "5.2L V10",
    transmission: "7-Speed Dual-Clutch",
    drivetrain: "AWD",
    weight: "3,400 lbs",
    suspension: "Magnetic Ride suspension",
    brakes: "Carbon ceramic",
    safety_equipment: "Roll cage, racing harness",
    images: [
      { image_url: "https://images.unsplash.com/photo-1514867644123-6385d58d3cd4" }
    ],
    category_name: "Sport",
    subcategory_name: "Luxury"
  },
  4: {
    id: "mock-4",
    name: "2019 McLaren 720S",
    short_description: "British engineering meets race track performance",
    detailed_description: "This McLaren 720S has been optimized for track days while maintaining its road-going capabilities. The perfect blend of British engineering and racing performance.",
    price: 245000,
    race_car_type: "GT",
    seller_type: "Private",
    created_at: "2025-02-10T00:00:00Z",
    make: "McLaren",
    model: "720S",
    year: 2019,
    mileage: 8900,
    location: "New York, NY",
    engine_specs: "4.0L Twin-Turbo V8",
    transmission: "7-Speed Dual-Clutch",
    drivetrain: "RWD",
    weight: "2,828 lbs",
    suspension: "Adaptive dampers",
    brakes: "Carbon ceramic",
    safety_equipment: "Track telemetry package",
    images: [
      { image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b" }
    ],
    category_name: "Sport",
    subcategory_name: "Supercar"
  },
  5: {
    id: "mock-5",
    name: "2023 Aston Martin Vantage",
    short_description: "British racing heritage",
    detailed_description: "This Aston Martin Vantage represents the best of British racing heritage. Featuring numerous track-focused upgrades while maintaining the elegant Aston Martin character.",
    price: 178000,
    race_car_type: "GT4",
    seller_type: "Dealer",
    created_at: "2025-04-05T00:00:00Z",
    make: "Aston Martin",
    model: "Vantage",
    year: 2023,
    mileage: 650,
    location: "Chicago, IL",
    engine_specs: "4.0L Twin-Turbo V8",
    transmission: "8-Speed Automatic",
    drivetrain: "RWD",
    weight: "3,373 lbs",
    suspension: "Adaptive suspension",
    brakes: "Cast iron discs",
    safety_equipment: "Racing harness points",
    images: [
      { image_url: "https://images.unsplash.com/photo-1542362567-b07e54358753" }
    ],
    category_name: "Sport",
    subcategory_name: "Luxury"
  },
  6: {
    id: "mock-6",
    name: "2018 Nissan GT-R Nismo",
    short_description: "Japanese performance icon",
    detailed_description: "This Nissan GT-R Nismo has been optimized for track use with numerous performance upgrades. A Japanese icon ready to dominate any circuit.",
    price: 135000,
    race_car_type: "Time Attack",
    seller_type: "Private",
    created_at: "2025-03-15T00:00:00Z",
    make: "Nissan",
    model: "GT-R Nismo",
    year: 2018,
    mileage: 12500,
    location: "Seattle, WA",
    engine_specs: "3.8L Twin-Turbo V6",
    transmission: "6-Speed Dual-Clutch",
    drivetrain: "AWD",
    weight: "3,865 lbs",
    suspension: "NISMO-tuned Bilstein",
    brakes: "Brembo performance",
    safety_equipment: "Track data logger",
    images: [
      { image_url: "/lovable-uploads/0142baeb-373b-448f-9a23-a1d1bc774af9.png" }
    ],
    category_name: "Sport",
    subcategory_name: "Performance"
  }
};

interface UseCarDetailsResult {
  carListing: CarListingWithImages | null;
  relatedListings: CarListingWithImages[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  images: string[];
}

export const useCarDetails = (id: string | undefined): UseCarDetailsResult => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [carListing, setCarListing] = useState<CarListingWithImages | null>(null);
  const [relatedListings, setRelatedListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);

        // Check if we're dealing with a mock ID (simple numeric ID)
        if (id && /^\d+$/.test(id) && mockCarListings[parseInt(id)]) {
          // Use mock data for demo purposes
          console.log(`Using mock data for car ID ${id}`);
          setCarListing(mockCarListings[parseInt(id)] as unknown as CarListingWithImages);
          
          // Set related listings from mock data
          const otherMockListings = Object.values(mockCarListings)
            .filter((car) => car.id !== `mock-${id}`)
            .slice(0, 4);
          setRelatedListings(otherMockListings as unknown as CarListingWithImages[]);
          
          setLoading(false);
          return;
        }

        // Attempt to fetch from database (for real UUID values)
        try {
          const { data: carData, error: carError } = await supabase
            .from('car_listings')
            .select(`
              *,
              images:car_images(*),
              category:categories(name),
              subcategory:subcategories(name)
            `)
            .eq('id', id)
            .single();

          if (carError) throw carError;
          
          if (!carData) {
            setError('Car listing not found');
            setCarListing(null);
          } else {
            // Format the data
            const formattedCar = {
              ...carData,
              category_name: carData.category?.name,
              subcategory_name: carData.subcategory?.name,
              primary_image: carData.images && carData.images.length > 0 
                ? carData.images.find((img: any) => img.is_primary)?.image_url || carData.images[0].image_url
                : null
            };
            
            setCarListing(formattedCar as CarListingWithImages);
            
            // Fetch related listings based on category, make, or model
            const { data: relatedData } = await supabase
              .from('car_listings')
              .select(`
                *,
                images:car_images(*),
                category:categories(name),
                subcategory:subcategories(name)
              `)
              .neq('id', id)
              .eq('status', 'active')
              .limit(4);
              
            if (relatedData) {
              const formattedRelated = relatedData.map((car: any) => ({
                ...car,
                category_name: car.category?.name,
                subcategory_name: car.subcategory?.name
              }));
              setRelatedListings(formattedRelated);
            }
          }
        } catch (err: any) {
          console.error('Error fetching car details from database:', err);
          
          // If we have a mock ID as a fallback, use it
          if (id && mockCarListings[parseInt(id)]) {
            console.log(`Falling back to mock data for car ID ${id}`);
            setCarListing(mockCarListings[parseInt(id)] as unknown as CarListingWithImages);
            
            // Set related listings from mock data
            const otherMockListings = Object.values(mockCarListings)
              .filter((car) => car.id !== `mock-${id}`)
              .slice(0, 4);
            setRelatedListings(otherMockListings as unknown as CarListingWithImages[]);
          } else {
            setError(err.message || 'Failed to load car details');
          }
        }
      } catch (err: any) {
        console.error('Error in car details logic:', err);
        setError(err.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  // Extract images from the car listing
  const images = carListing?.images && carListing.images.length > 0 
    ? carListing.images.map(img => img.image_url)
    : [];

  return {
    carListing,
    relatedListings,
    loading,
    error,
    isLoggedIn,
    images
  };
};
