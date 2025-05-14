
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
      
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Clear any previous session data to prevent conflicts
      localStorage.removeItem('checkered-flag-finder.user');
      
      // Implement login with retry mechanism for reliability
      let loginAttempts = 0;
      const maxAttempts = 3;
      let loginSuccess = false;
      let sessionData = null;
      let loginError = null;
      
      while (loginAttempts < maxAttempts && !loginSuccess) {
        try {
          console.log(`Login attempt ${loginAttempts + 1}/${maxAttempts}`);
          
          // Direct login attempt with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            loginError = error;
            console.error('Login attempt failed:', error);
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else if (!data || !data.session) {
            loginError = new Error('No session returned');
            console.error('Login attempt failed: No session data');
          } else {
            // Success!
            loginSuccess = true;
            sessionData = data;
            console.log('Login successful');
          }
        } catch (e) {
          loginError = e;
          console.error('Unexpected error during login:', e);
        }
        
        loginAttempts++;
      }
      
      if (!loginSuccess || !sessionData) {
        throw loginError || new Error('Login failed after multiple attempts');
      }
      
      // Store session info with proper key matching the Supabase client config
      localStorage.setItem('checkered-flag-finder.user', JSON.stringify({
        id: sessionData.user?.id,
        email: sessionData.user?.email,
        last_login: new Date().toISOString()
      }));
      
      // Verify session is properly stored
      const { data: sessionCheck } = await supabase.auth.getSession();
      console.log('Session verification:', sessionCheck.session ? 'Valid session found' : 'No session found');
      
      toast.success('Login successful!');
      navigate('/');
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
