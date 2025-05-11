
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalBlogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total car listings
        const { count: listingsCount } = await supabase
          .from('car_listings')
          .select('*', { count: 'exact', head: true });

        // Get total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total messages
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        // Get total blog posts
        const { count: blogsCount } = await supabase
          .from('blog_articles')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalListings: listingsCount || 0,
          totalUsers: usersCount || 0,
          totalMessages: messagesCount || 0,
          totalBlogs: blogsCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Car Listings",
      value: stats.totalListings,
      icon: <Car className="h-8 w-8" />,
      link: "/admin/listings",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Registered Users",
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8" />,
      link: "/admin/users",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: <MessageSquare className="h-8 w-8" />,
      link: "/admin/messages",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Blog Articles",
      value: stats.totalBlogs,
      icon: <FileText className="h-8 w-8" />,
      link: "/admin/blog",
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <h3 className="text-2xl font-bold">
                      {loading ? "..." : card.value.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Recent admin activities will be displayed here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Authentication</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
