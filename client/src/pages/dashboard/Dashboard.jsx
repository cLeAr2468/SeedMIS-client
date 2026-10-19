import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sprout,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import SeedlingCard from '@/pages/shop/layout/SeedlingCard';
import requestService from '@/services/requestService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, totalItems, openCart } = useCart();
  const [requests, setRequests] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(true);

  useEffect(() => {
    fetchRequests();
    fetchNewArrivals();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');

      if (response.data.success) {
        const clientOrders = response.data.data.filter(
          (req) => req.requester_type === 'client' && req.client_id === user?.id
        );
        setRequests(clientOrders);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const response = await requestService.getAvailableSeedlings();
      if (response.success) {
        // Sort by created_at descending and take first 8 (newest)
        const sorted = [...response.data].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setNewArrivals(sorted.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoadingArrivals(false);
    }
  };

  const addToCartHandler = (seedling) => {
    addToCart(seedling);
    // Optionally navigate to shop after adding
    // navigate('/shop');
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    released: requests.filter((r) => r.status === 'Released').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'text-yellow-600 bg-yellow-50',
      Approved: 'text-blue-600 bg-blue-50',
      Released: 'text-green-600 bg-green-50',
      Rejected: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: Clock,
      Approved: CheckCircle,
      Released: CheckCircle,
      Rejected: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar 
        cartCount={totalItems}
        onCartClick={openCart}
      />
      <MobileHeader title="Home" />

      <main className="pb-20 lg:pb-8">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome , {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Discover quality seedlings for your farming needs
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 lg:mb-12">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Released
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.released}</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured CTA Banner */}
          <Card className="mb-8 lg:mb-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Need Quality Seedlings?
                  </h2>
                  <p className="text-green-50 text-lg">
                    Browse our wide selection of healthy, ready-to-plant seedlings
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/shop')}
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Browse All Seedlings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New Arrivals Section */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-green-600" />
                  New Arrivals
                </h2>
                <p className="text-gray-600 mt-1">
                  Fresh inventory just added to our collection
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/shop')}
                className="hidden lg:flex border-green-600 text-green-600 hover:bg-green-50"
              >
                View All
              </Button>
            </div>

            {loadingArrivals ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading new arrivals...</p>
              </div>
            ) : newArrivals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No new arrivals at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {newArrivals.map((seedling) => (
                  <SeedlingCard
                    key={seedling.id}
                    seedling={seedling}
                    onAddToCart={addToCartHandler}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 text-center lg:hidden">
              <Button
                variant="outline"
                onClick={() => navigate('/shop')}
                className="w-full border-green-600 text-green-600"
              >
                View All Seedlings
              </Button>
            </div>
          </div>

          {/* Recent Requests Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl lg:text-2xl">Recent Requests</CardTitle>
                <Button
                  variant="link"
                  className="text-green-600"
                  onClick={() => navigate('/orders')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No requests yet</p>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600"
                    onClick={() => navigate('/shop')}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/orders')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {request.seedling_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.quantity?.toLocaleString()} seedlings
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
