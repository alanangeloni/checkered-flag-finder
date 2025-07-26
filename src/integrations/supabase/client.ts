
// Simple Supabase client configuration for public access only
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - these are public/publishable keys
const SUPABASE_URL = 'https://vxkzrgsseeiuamimxiih.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4a3pyZ3NzZWVpdWFtaW14aWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Nzk3NDgsImV4cCI6MjA2MjI1NTc0OH0.ojLHy-T6jH0Y0hPEa4i66Cz7j3NahF-yUdJATbQXSTU';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create a simple Supabase client with minimal configuration
// No auth persistence or complex settings that could cause issues
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false, // Don't persist sessions
    autoRefreshToken: false, // Don't auto refresh tokens
    detectSessionInUrl: false, // Don't detect session in URL
    storage: {
      // Simple in-memory storage implementation that doesn't use localStorage
      // This avoids any issues with localStorage and session persistence
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  },
  global: {
    headers: {
      'x-application-name': 'checkered-flag-finder'
    }
  }
});

// Simple initialization for public data access only
(async () => {

  try {
    console.log('Initializing Supabase client for public access...');
    
    // Simple check to make sure we can access the car_listings table
    const { data, error } = await supabase
      .from('car_listings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error accessing car_listings table:', error);
    } else {
      console.log('Successfully connected to car_listings table');
    }
    
    console.log('Supabase client initialized for public access');
  } catch (error) {
    console.error('Error during Supabase initialization:', error);
  }
})();
