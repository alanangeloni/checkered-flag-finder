
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  published: boolean;
  created_at: string;
}

const AdminBlogManager = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<BlogArticle>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    published: false
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch blog articles');
      console.error('Error fetching blog articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentArticle(prev => ({ ...prev, [name]: checked }));
  };

  const openNewArticleDialog = () => {
    setCurrentArticle({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      published: false
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (article: BlogArticle) => {
    setCurrentArticle(article);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!currentArticle.title || !currentArticle.slug || !currentArticle.content) {
        toast.error('Title, slug and content are required');
        return;
      }

      if (isEditing && currentArticle.id) {
        const { error } = await supabase
          .from('blog_articles')
          .update({
            title: currentArticle.title,
            slug: currentArticle.slug,
            excerpt: currentArticle.excerpt,
            content: currentArticle.content,
            featured_image: currentArticle.featured_image,
            published: currentArticle.published
          })
          .eq('id', currentArticle.id);

        if (error) throw error;
        toast.success('Article updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_articles')
          .insert([{
            title: currentArticle.title,
            slug: currentArticle.slug,
            excerpt: currentArticle.excerpt,
            content: currentArticle.content,
            featured_image: currentArticle.featured_image,
            published: currentArticle.published
          }]);

        if (error) throw error;
        toast.success('Article created successfully');
      }

      setIsDialogOpen(false);
      fetchArticles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save article');
      console.error('Error saving article:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('blog_articles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Article deleted successfully');
        fetchArticles();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete article');
        console.error('Error deleting article:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Blog Articles</h2>
        <Button onClick={openNewArticleDialog}>Add New Article</Button>
      </div>

      {isLoading ? (
        <p>Loading blog articles...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No blog articles found</TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.slug}</TableCell>
                  <TableCell>{article.published ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title">Title</label>
                <Input 
                  id="title" 
                  name="title" 
                  value={currentArticle.title} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug">Slug</label>
                <Input 
                  id="slug" 
                  name="slug" 
                  value={currentArticle.slug} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="excerpt">Excerpt</label>
              <Textarea 
                id="excerpt" 
                name="excerpt" 
                value={currentArticle.excerpt || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content">Content</label>
              <Textarea 
                id="content" 
                name="content" 
                value={currentArticle.content || ''} 
                onChange={handleInputChange} 
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="featured_image">Featured Image URL</label>
              <Input 
                id="featured_image" 
                name="featured_image" 
                value={currentArticle.featured_image || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="published" 
                name="published" 
                checked={currentArticle.published} 
                onChange={handleCheckboxChange}
                className="h-4 w-4" 
              />
              <label htmlFor="published">Published</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrUpdate}>{isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogManager;
