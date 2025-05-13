
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Starting login process...');
      
      // Clear any previous sessions first to avoid conflicts
      await supabase.auth.signOut();
      console.log('Previous sessions cleared');
      
      // Maximum number of retries
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let loginSuccessful = false;
      let lastError: any = null;
      
      // Retry login with exponential backoff
      while (retryCount < MAX_RETRIES && !loginSuccessful) {
        try {
          console.log(`Login attempt ${retryCount + 1}/${MAX_RETRIES}`);
          
          // Attempt to sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            console.error(`Login attempt ${retryCount + 1} error:`, error);
            lastError = error;
            throw error;
          }
          
          if (!data.session) {
            const noSessionError = new Error('No session returned from authentication');
            console.error(`Login attempt ${retryCount + 1} error:`, noSessionError);
            lastError = noSessionError;
            throw noSessionError;
          }
          
          // Verify the session was created
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            const sessionValidationError = new Error('Session validation failed');
            console.error(`Login attempt ${retryCount + 1} error:`, sessionValidationError);
            lastError = sessionValidationError;
            throw sessionValidationError;
          }
          
          // If we got here, login was successful
          loginSuccessful = true;
          console.log('Login successful, session established');
          
          // Store user info in localStorage for better persistence
          try {
            localStorage.setItem('checkered-flag-user', JSON.stringify({
              id: data.user?.id,
              email: data.user?.email,
              last_login: new Date().toISOString()
            }));
          } catch (storageError) {
            console.warn('Could not save user data to localStorage:', storageError);
            // Non-critical error, continue
          }
          
          toast.success('Login successful!');
          navigate('/');
        } catch (attemptError) {
          retryCount++;
          
          if (retryCount < MAX_RETRIES) {
            // Wait with exponential backoff before retrying
            const delay = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s
            console.log(`Retrying login in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we exhausted all retries and still failed
      if (!loginSuccessful) {
        throw lastError || new Error('Login failed after multiple attempts');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials and try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-racecar-darkgray">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login to your Account</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-racecar-red hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-racecar-red hover:bg-red-700" 
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-xs text-center mt-2 text-gray-500">
                Having trouble? Try refreshing the page or clearing your browser cache.
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-racecar-red hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
