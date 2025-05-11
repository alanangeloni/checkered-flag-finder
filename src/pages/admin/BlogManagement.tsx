
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  author?: {
    full_name: string | null;
    username: string | null;
  };
  category?: {
    name: string;
  };
}

const AdminBlogManagement = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select(`
            *,
            author:profiles(full_name, username),
            category:blog_categories(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setArticles(data || []);
        setFilteredArticles(data || []);
      } catch (error: any) {
        console.error("Error fetching blog articles:", error);
        toast.error(error.message || "Error fetching blog articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm, articles]);

  const togglePublishStatus = async (id: string, currentlyPublished: boolean) => {
    try {
      const updateData: any = { published: !currentlyPublished };
      
      // If we're publishing, set the published date to now
      if (!currentlyPublished) {
        updateData.published_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('blog_articles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === id ? { 
            ...article, 
            published: !currentlyPublished,
            published_at: !currentlyPublished ? new Date().toISOString() : article.published_at
          } : article
        )
      );
      
      toast.success(`Article ${!currentlyPublished ? 'published' : 'unpublished'}`);
    } catch (error: any) {
      console.error("Error updating article status:", error);
      toast.error(error.message || "Error updating article status");
    }
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
      toast.success("Article deleted successfully");
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast.error(error.message || "Error deleting article");
    }
  };

  const formatAuthorName = (author: { full_name: string | null, username: string | null } | undefined) => {
    if (!author) return "No author";
    return author.full_name || author.username || "Unknown";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            <span>New Article</span>
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading articles...</TableCell>
                </TableRow>
              ) : filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No blog articles found</TableCell>
                </TableRow>
              ) : (
                filteredArticles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-xs text-gray-500 truncate w-64">{article.excerpt || article.content.substring(0, 100)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatAuthorName(article.author)}</TableCell>
                    <TableCell>{article.category?.name || "Uncategorized"}</TableCell>
                    <TableCell>
                      {article.published ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Published</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Draft</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(article.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/blog/${article.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/blog/edit/${article.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => togglePublishStatus(article.id, article.published)}
                          className={article.published ? "text-yellow-500" : "text-green-500"}
                        >
                          {article.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteArticle(article.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManagement;
