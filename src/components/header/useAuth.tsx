
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener in Header");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in Header:", event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        
        // Check admin status
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(data?.is_admin || false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Check current session
    const checkUser = async () => {
      try {
        console.log("Checking current session in Header");
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("User found in session:", session.user.id);
          setUser(session.user);
          
          // Check if user is admin
          const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(data?.is_admin || false);
        } else {
          console.log("No user in session");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking authentication in Header:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      setUser(null);
      setIsAdmin(false);
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    signOut
  };
};
