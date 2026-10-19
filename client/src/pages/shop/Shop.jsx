import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, ShoppingCart, Sprout } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import requestService from '@/services/requestService';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import CategoryFilter from './layout/CategoryFilter';

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, totalItems, openCart } = useCart();
  const [seedlings, setSeedlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchSeedlings();
  }, []);

  const fetchSeedlings = async () => {
    try {
      const response = await requestService.getAvailableSeedlings();
      if (response.success) {
        setSeedlings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load seedlings');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Seedling', 'Grafted'];

  const filteredSeedlings = seedlings.filter((seedling) => {
    const matchesSearch = seedling.seedling_type
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const typeContains = seedling.seedling_type.toLowerCase();
      if (selectedCategory === 'Grafted') {
        matchesCategory = typeContains.includes('graft');
      } else if (selectedCategory === 'Seedling') {
        matchesCategory = !typeContains.includes('graft');
      }
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <DesktopSidebar 
        cartCount={totalItems}
        onCartClick={openCart}
      />

      {/* Mobile Header */}
      <MobileHeader
        title="Browse Seedlings"
        cartCount={totalItems}
        onCartClick={openCart}
        showCart
      />

      <main className="lg:pb-8 pb-20">
        {/* Hero Banner with Real Image */}
        <div className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white overflow-hidden">
          {/* Hero Image Background */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                  Grow a Greener Tomorrow
                </h1>
                <p className="text-lg lg:text-xl text-green-50 leading-relaxed">
                  Request and plant quality seedlings for a healthier and more sustainable future.
                </p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Search Bar & View My Requests Button */}
        <div className="bg-white border-b p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search seedlings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Category Filter */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* View My Requests Button */}
              <Button 
                onClick={() => navigate('/orders')}
                className="bg-green-600 hover:bg-green-700 h-12 px-6 whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View My Requests
              </Button>
            </div>
          </div>
        </div>

        {/* Seedlings Grid */}
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-gray-600">Loading seedlings...</p>
              </div>
            ) : filteredSeedlings.length === 0 ? (
              <div className="text-center py-12">
                <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No seedlings found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredSeedlings.map((seedling) => {
                  const isLowStock = seedling.total_quantity <= 50;
                  const isOutOfStock = seedling.total_quantity === 0;
                  
                  // Get actual seedling image or use real seedling photo from Unsplash
                  const getSeedlingImage = () => {
                    if (seedling.image_url) {
                      if (seedling.image_url.startsWith('http')) {
                        return seedling.image_url;
                      }
                      const isProduction = window.location.hostname !== 'localhost';
                      const baseUrl = isProduction 
                        ? 'https://seedmis-server-production.up.railway.app'
                        : 'http://localhost:8000';
                      return `${baseUrl}/${seedling.image_url}`;
                    }
                    // Fallback to real seedling images
                    return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
                  };
                  
                  return (
                    <Card key={seedling.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-xl">
                      {/* Image Section with Classification Badge */}
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={getSeedlingImage()}
                          alt={seedling.seedling_type}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
                          }}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Classification Badge - Top Left (from database) */}
                        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                          {seedling.classification === 'Crafted' ? 'Grafted' : seedling.classification}
                        </span>

                        {/* Low Stock Badge - Top Right */}
                        {isLowStock && !isOutOfStock && (
                          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                            Low Stock
                          </span>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <CardContent className="p-5 flex-1 flex flex-col bg-white">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">
                          {seedling.seedling_type}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                          {(seedling.classification === 'Grafted' || seedling.classification === 'Crafted') 
                            ? 'Grafted variety' 
                            : 'Healthy and high-yield variety'}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="font-bold text-green-600 text-2xl">
                                ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500">/ pc</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Available:</span>
                            <span className={`text-sm font-semibold ${isLowStock && !isOutOfStock ? 'text-orange-600' : isOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                              {seedling.total_quantity}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-end">
                            <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                              {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="space-y-2 mt-auto">
                          <Button
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium h-11"
                            onClick={() => addToCart(seedling)}
                            disabled={isOutOfStock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full border-green-700 text-green-700 hover:bg-green-50 font-medium h-11"
                            onClick={() => {
                              addToCart(seedling);
                              navigate('/orders');
                            }}
                            disabled={isOutOfStock}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Shop;
