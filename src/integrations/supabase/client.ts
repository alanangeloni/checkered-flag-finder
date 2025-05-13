
// Supabase client configuration with enhanced reliability and session handling
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vxkzrgsseeiuamimxiih.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4a3pyZ3NzZWVpdWFtaW14aWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Nzk3NDgsImV4cCI6MjA2MjI1NTc0OH0.ojLHy-T6jH0Y0hPEa4i66Cz7j3NahF-yUdJATbQXSTU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create a singleton instance of the Supabase client with improved persistence and auth settings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'checkered-flag-finder-auth',
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item;
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'x-application-name': 'checkered-flag-finder'
    }
  }
  // Note: Custom fetch configuration removed due to TypeScript compatibility issues
  // The retry mechanism is implemented at the component level instead
});

// Enhanced initialization with retry mechanism and proper error handling
(async () => {
  // Maximum number of retries for database operations
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Helper function to retry operations with exponential backoff
  const retryOperation = async (operation: () => Promise<any>, name: string, maxRetries = MAX_RETRIES) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${name}: Attempt ${attempt}/${maxRetries}`);
        const result = await operation();
        console.log(`${name}: Operation successful`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`${name}: Attempt ${attempt}/${maxRetries} failed:`, error);
        if (attempt < maxRetries) {
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`${name}: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  try {
    console.log('Initializing Supabase client with enhanced reliability...');
    
    // Check if auth is working
    await retryOperation(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    }, 'Auth Check');
    
    // Check if car_listings table is accessible - this is critical for the app
    await retryOperation(async () => {
      const { data, error } = await supabase
        .from('car_listings')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      console.log('Successfully connected to car_listings table');
      return data;
    }, 'Car Listings Check');
    
    // Check storage buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.warn('Storage service warning:', bucketsError.message);
      } else {
        console.log('Available storage buckets:', buckets?.map(b => b.name).join(', '));
        
        // Check car_images bucket specifically
        if (buckets?.some(bucket => bucket.name === 'car_images')) {
          console.log('car_images bucket is available');
        } else {
          console.warn('Warning: car_images bucket not found. Some images may not display correctly.');
        }
      }
    } catch (storageError) {
      // Non-critical error, just log it
      console.warn('Storage service warning:', storageError);
    }
    
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Critical error during Supabase initialization:', error);
    // Log the error but don't crash the application
    // We'll handle connection issues gracefully in the components
  }
})();
