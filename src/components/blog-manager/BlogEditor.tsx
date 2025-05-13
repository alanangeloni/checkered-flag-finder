
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { UploadCloud, X } from 'lucide-react';
import { BlogPost } from '@/types/customTypes';

// Form schema for blog post
const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  published: z.boolean().default(false),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogEditorProps {
  post?: BlogPost;
  onSaved?: () => void;
}

const BlogEditor = ({ post, onSaved }: BlogEditorProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(post?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      published: post?.published || false,
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        published: post.published || false,
      });
      setPreviewImage(post.image_url);
    }
  }, [post, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const onSubmit = async (values: BlogPostFormValues) => {
    try {
      setIsSubmitting(true);
      
      let imageUrl = post?.image_url || '';
      
      // Handle image upload if there's a new image
      if (imageFile) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("You must be logged in to upload images");
          return;
        }

        // Create a unique file name
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        // Upload image to Supabase Storage
        const { error: storageError } = await supabase
          .storage
          .from('blog_images')
          .upload(filePath, imageFile);

        if (storageError) {
          throw storageError;
        }

        // Get the public URL
        const { data: urlData } = await supabase
          .storage
          .from('blog_images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const slug = generateSlug(values.title);
      
      if (post) {
        // Update existing post
        const { error } = await supabase
          .from('blog_articles')
          .update({
            title: values.title,
            slug: slug,
            excerpt: values.excerpt,
            content: values.content,
            featured_image: imageUrl, // Update the featured_image field in the database
            published: values.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);
        
        if (error) throw error;
        toast.success("Blog post updated successfully");
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_articles')
          .insert({
            title: values.title,
            slug: slug,
            excerpt: values.excerpt,
            content: values.content,
            featured_image: imageUrl, // Store the imageUrl in the featured_image field
            published: values.published,
          });
        
        if (error) throw error;
        toast.success("Blog post created successfully");
        form.reset({
          title: '',
          excerpt: '',
          content: '',
          published: false,
        });
        setPreviewImage(null);
        setImageFile(null);
      }
      
      if (onSaved) onSaved();
      
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the blog post"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Featured Image</FormLabel>
          <Card className="mt-2 border-2 border-dashed border-gray-300 p-6">
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Blog preview" 
                  className="w-full h-64 object-cover" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload a featured image</p>
                <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  Select Image
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your blog post content here"
                  className="min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Published</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this post visible to visitors
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
      </form>
    </Form>
  );
};

export default BlogEditor;
