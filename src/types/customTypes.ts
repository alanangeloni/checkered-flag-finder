
import type { Database } from '@/integrations/supabase/types';

// Create type aliases from the auto-generated types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CarListing = Database['public']['Tables']['car_listings']['Row'];
export type CarImage = Database['public']['Tables']['car_images']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Subcategory = Database['public']['Tables']['subcategories']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];
export type BlogArticle = Database['public']['Tables']['blog_articles']['Row'];
export type PricingPlan = Database['public']['Tables']['pricing_plans']['Row'];
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];

// Add any additional custom types that aren't directly from the database here
export type CarListingWithImages = CarListing & {
  images: CarImage[];
  primary_image?: string;
  category_name?: string;
  subcategory_name?: string;
};

export type MessageWithProfiles = Message & {
  sender: Profile;
  recipient: Profile;
};
