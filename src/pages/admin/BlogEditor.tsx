
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Category {
  id: string;
  name: string;
}

const BlogEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [published, setPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setCategories(data || []);
      } catch (error: any) {
        toast.error("Error loading categories");
        console.error(error);
      }
    };
    
    const fetchArticle = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setExcerpt(data.excerpt || '');
          setContent(data.content);
          setFeaturedImage(data.featured_image || '');
          setCategoryId(data.category_id || '');
          setPublished(data.published || false);
        }
      } catch (error: any) {
        toast.error("Error loading article");
        console.error(error);
        navigate('/admin/blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchArticle();
  }, [id, isEditMode, navigate]);
  
  // Generate slug from title
  useEffect(() => {
    if (!isEditMode || slug === '') {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title, isEditMode, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title || !slug || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        toast.error("You must be logged in to save articles");
        return;
      }
      
      const articleData = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featured_image: featuredImage || null,
        category_id: categoryId || null,
        published,
        author_id: userId,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing article
        result = await supabase
          .from('blog_articles')
          .update(articleData)
          .eq('id', id);
      } else {
        // Create new article
        result = await supabase
          .from('blog_articles')
          .insert([{
            ...articleData,
            created_at: new Date().toISOString(),
            published_at: published ? new Date().toISOString() : null
          }]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditMode ? "Article updated successfully" : "Article created successfully");
      navigate('/admin/blog');
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast.error(error.message || "Error saving article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Article' : 'New Article'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="slug">Slug*</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of the article"
                className="h-24"
              />
            </div>
            
            <div>
              <Label htmlFor="featured-image">Featured Image URL</Label>
              <Input
                id="featured-image"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {featuredImage && (
                <div className="mt-2">
                  <img 
                    src={featuredImage} 
                    alt="Preview" 
                    className="h-32 object-cover rounded-md" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="published" 
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="content">Content*</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Article content (supports Markdown)"
              className="h-[calc(100%-2rem)] min-h-[400px]"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-3 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/blog')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditMode ? 'Update Article' : 'Create Article'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
