import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import requestService from '@/services/requestService';

const Home = () => {
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
    const [imageError, setImageError] = useState(false);

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
    const showImage = imageUrl && !imageError;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
        {/* Image Section */}
        <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center relative overflow-hidden">
          {showImage ? (
            <img
              src={imageUrl}
              alt={seedling.seedling_type}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <Sprout className="w-20 h-20 lg:w-24 lg:h-24 text-green-600 group-hover:scale-110 transition-transform" />
          )}
          
          {/* Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs py-2 text-center font-semibold">
              OUT OF STOCK
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
              Low Stock
            </span>
          )}
          
          {/* Stock Count Badge */}
          {!isOutOfStock && (
            <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
              {seedling.total_quantity?.toLocaleString()} available
            </span>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-3 text-base lg:text-lg line-clamp-2 min-h-[3rem] group-hover:text-green-700 transition-colors">
            {seedling.seedling_type}
          </h3>

          <div className="mt-auto">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-gray-500">Price per unit</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">
                  ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Availability Status */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm">
                {isOutOfStock ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Currently Unavailable</span>
                  </>
                ) : isLowStock ? (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-600 font-medium">Limited Stock</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">In Stock</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileHeader title="Home" />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 lg:mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Seedling Catalog
                </h1>
                <p className="text-gray-600 text-sm lg:text-base mt-1">
                  Browse our complete collection of quality seedlings
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
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

          {/* Stats Bar */}
          <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Varieties</p>
                <p className="text-2xl font-bold text-gray-900">{seedlings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {seedlings.filter(s => s.total_quantity > 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {seedlings.filter(s => s.total_quantity > 0 && s.total_quantity <= 50).length}
                </p>
              </div>
            </div>
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
