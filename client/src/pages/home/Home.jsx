import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Loader2, Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import requestService from '@/services/requestService';
import { useCart } from '@/context/CartContext';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems, openCart } = useCart();
  const [seedlings, setSeedlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSeedlings();
  }, []);

  const fetchSeedlings = async () => {
    try {
      setLoading(true);
      const response = await requestService.getAvailableSeedlings();
      if (response.success) {
        // Sort by seedling type alphabetically
        const sorted = [...response.data].sort((a, b) =>
          a.seedling_type.localeCompare(b.seedling_type)
        );
        setSeedlings(sorted);
      }
    } catch (error) {
      console.error('Error fetching seedlings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeedlings = seedlings.filter((seedling) =>
    seedling.seedling_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SeedlingDisplayCard = ({ seedling }) => {
    const isLowStock = seedling.total_quantity <= 50;
    const isOutOfStock = seedling.total_quantity === 0;

    const getImageUrl = () => {
      if (!seedling.image_url) return null;
      if (seedling.image_url.startsWith('http')) {
        return seedling.image_url;
      }
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const baseUrl = isProduction
        ? 'https://seedmis-server-production.up.railway.app'
        : 'http://localhost:8000';
      return `${baseUrl}/${seedling.image_url}`;
    };

    const imageUrl = getImageUrl();

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col rounded-xl">
        {/* Image Section with Classification Badge */}
        <div className="aspect-square relative overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={seedling.seedling_type}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
              <Sprout className="w-20 h-20 lg:w-24 lg:h-24 text-green-600" />
            </div>
          )}
          
          {/* Classification Badge from Database - Top Left */}
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar 
        cartCount={totalItems}
        onCartClick={openCart}
      />
      <MobileHeader 
        title="Home"
        cartCount={totalItems}
        onCartClick={openCart}
      />

      <main className="pb-20 lg:pb-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                  Grow a Greener Tomorrow
                </h1>
                <p className="text-lg lg:text-xl text-green-50 mb-6 leading-relaxed">
                  Request and plant quality seedlings for a healthier and more sustainable future.
                </p>
              </div>
              
              {/* Right Image */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-white/10 rounded-full absolute blur-3xl"></div>
                  <svg className="w-64 h-64 relative z-10" viewBox="0 0 200 200" fill="none">
                    {/* Seedling illustration */}
                    <circle cx="100" cy="150" r="40" fill="#8B4513" opacity="0.6"/>
                    <rect x="95" y="80" width="10" height="70" fill="#10B981" rx="2"/>
                    <ellipse cx="85" cy="60" rx="25" ry="35" fill="#34D399" transform="rotate(-20 85 60)"/>
                    <ellipse cx="115" cy="65" rx="25" ry="35" fill="#10B981" transform="rotate(20 115 65)"/>
                    <ellipse cx="100" cy="45" rx="20" ry="30" fill="#34D399"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        </div>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Search & View My Requests */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search seedlings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Hero Section - Old title, now simplified */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Available Seedlings
            </h2>
            <p className="text-gray-600">
              {filteredSeedlings.length} {filteredSeedlings.length === 1 ? 'variety' : 'varieties'} available
            </p>
          </div>

          {/* Seedlings Grid */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading seedlings...</p>
            </div>
          ) : filteredSeedlings.length === 0 ? (
            <div className="text-center py-16">
              <Sprout className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery ? 'No seedlings found matching your search' : 'No seedlings available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-sm text-gray-600 mb-4">
                  Showing {filteredSeedlings.length} of {seedlings.length} seedlings
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeedlings.map((seedling) => (
                  <SeedlingDisplayCard key={seedling.id} seedling={seedling} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
