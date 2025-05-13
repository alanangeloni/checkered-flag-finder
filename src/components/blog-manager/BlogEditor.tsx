
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
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '@/types/customTypes';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from './RichTextEditor';

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
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.image_url || null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [contentImages, setContentImages] = useState<{id: string, file: File, preview: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorCursorPosition, setEditorCursorPosition] = useState<number | null>(null);
  const contentTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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
      setFeaturedImage(post.image_url);
    }
  }, [post, form]);

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFeaturedImageFile(file);
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImageFile(null);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const imageId = uuidv4();
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = {
        id: imageId,
        file,
        preview: reader.result as string
      };
      setContentImages([...contentImages, newImage]);
      
      // Insert image placeholder at cursor position
      if (contentTextareaRef.current && editorCursorPosition !== null) {
        const content = form.getValues('content');
        const imagePlaceholder = `\n![${file.name}](image:${imageId})\n`;
        const newContent = 
          content.substring(0, editorCursorPosition) + 
          imagePlaceholder + 
          content.substring(editorCursorPosition);
        
        form.setValue('content', newContent);
      } else {
        const currentContent = form.getValues('content');
        const imagePlaceholder = `\n![${file.name}](image:${imageId})\n`;
        form.setValue('content', currentContent + imagePlaceholder);
      }
    };
    reader.readAsDataURL(file);
    
    // Clear input to allow selecting same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const saveContentCursorPosition = () => {
    if (contentTextareaRef.current) {
      setEditorCursorPosition(contentTextareaRef.current.selectionStart);
    }
  };

  // This function is no longer needed as the rich text editor handles formatting
  const insertFormat = (format: string) => {
    // Kept for backward compatibility but functionality moved to RichTextEditor
    console.log('Format requested:', format);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to upload images");
        return;
      }
      
      // Process content images first
      let processedContent = values.content;
      
      for (const image of contentImages) {
        if (processedContent.includes(`image:${image.id}`)) {
          // Upload the image to storage
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${Date.now()}-${image.id}.${fileExt}`;
          const filePath = `blog/content/${fileName}`;

          const { error: uploadError } = await supabase
            .storage
            .from('blog_images')
            .upload(filePath, image.file);

          if (uploadError) {
            console.error('Error uploading content image:', uploadError);
            continue;
          }

          // Get the public URL
          const { data: urlData } = await supabase
            .storage
            .from('blog_images')
            .getPublicUrl(filePath);

          // Replace the placeholder with the actual URL
          processedContent = processedContent.replace(`image:${image.id}`, urlData.publicUrl);
        }
      }
      
      // Handle featured image upload
      let featuredImageUrl = post?.image_url || '';
      
      if (featuredImageFile) {
        // Create a unique file name
        const fileExt = featuredImageFile.name.split('.').pop();
        const fileName = `featured-${Date.now()}.${fileExt}`;
        const filePath = `blog/featured/${fileName}`;

        // Upload image to Supabase Storage
        const { error: storageError } = await supabase
          .storage
          .from('blog_images')
          .upload(filePath, featuredImageFile);

        if (storageError) {
          throw storageError;
        }

        // Get the public URL
        const { data: urlData } = await supabase
          .storage
          .from('blog_images')
          .getPublicUrl(filePath);

        featuredImageUrl = urlData.publicUrl;
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
            content: processedContent,
            featured_image: featuredImageUrl,
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
            content: processedContent,
            featured_image: featuredImageUrl,
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
        setFeaturedImage(null);
        setFeaturedImageFile(null);
        setContentImages([]);
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
            {featuredImage ? (
              <div className="relative">
                <img 
                  src={featuredImage} 
                  alt="Blog preview" 
                  className="w-full h-64 object-cover" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeFeaturedImage}
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
                  id="featured-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFeaturedImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('featured-image')?.click()}
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
              <div className="space-y-2">
                <FormControl>
                  <RichTextEditor 
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    onImageUploadRequest={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        // Create a synthetic event that matches what handleContentImageUpload expects
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          const syntheticEvent = {
                            target: { files, value: '' },
                            preventDefault: () => {}
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          handleContentImageUpload(syntheticEvent);
                        }
                      };
                      input.click();
                    }}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  Supports Markdown formatting. Use the toolbar for quick formatting options.
                </p>
              </div>
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
