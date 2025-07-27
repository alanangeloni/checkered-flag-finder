-- Enable RLS on remaining tables that don't have it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add missing policies for new tables
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Subcategories are viewable by everyone" 
ON public.subcategories 
FOR SELECT 
USING (true);

CREATE POLICY "Blog categories are viewable by everyone" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Pricing plans are viewable by everyone" 
ON public.pricing_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add missing INSERT policy for profiles (needed for user registration)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);