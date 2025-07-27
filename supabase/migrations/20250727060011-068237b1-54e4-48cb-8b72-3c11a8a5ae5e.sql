-- Enable Row Level Security on all tables
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Car listings policies - users can only manage their own listings
CREATE POLICY "Users can view all active car listings" 
ON public.car_listings 
FOR SELECT 
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own car listings" 
ON public.car_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car listings" 
ON public.car_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car listings" 
ON public.car_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Car images policies - users can only manage images for their own cars
CREATE POLICY "Users can view car images for active listings" 
ON public.car_images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE car_listings.id = car_images.car_id 
    AND (car_listings.status = 'active' OR car_listings.user_id = auth.uid())
  )
);

CREATE POLICY "Users can create images for their own cars" 
ON public.car_images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE car_listings.id = car_images.car_id 
    AND car_listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update images for their own cars" 
ON public.car_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE car_listings.id = car_images.car_id 
    AND car_listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images for their own cars" 
ON public.car_images 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.car_listings 
    WHERE car_listings.id = car_images.car_id 
    AND car_listings.user_id = auth.uid()
  )
);

-- Profiles policies - users can view all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Blog articles policies - public read, admin write
CREATE POLICY "Published blog articles are viewable by everyone" 
ON public.blog_articles 
FOR SELECT 
USING (published = true);

CREATE POLICY "Authenticated users can create blog articles" 
ON public.blog_articles 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blog articles" 
ON public.blog_articles 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blog articles" 
ON public.blog_articles 
FOR DELETE 
USING (auth.uid() = author_id);

-- Messages policies - users can only see their own messages
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Categories policies - public read only
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);