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
import QuickRequestDialog from './layout/QuickRequestDialog';

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, totalItems, openCart } = useCart();
  const [seedlings, setSeedlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeedling, setSelectedSeedling] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

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
      // Check classification field instead of seedling_type
      const classification = seedling.classification?.toLowerCase() || '';
      
      if (selectedCategory === 'Grafted') {
        // Match if classification is "Grafted" or "Crafted" (typo variant)
        matchesCategory = classification === 'grafted' || classification === 'crafted';
      } else if (selectedCategory === 'Seedling') {
        // Match if classification is NOT grafted/crafted
        matchesCategory = classification !== 'grafted' && classification !== 'crafted';
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
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
                    <Card key={seedling.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Responsive Image Section */}
                      <div className="relative h-32 lg:h-44 bg-gray-100">
                        <img
                          src={getSeedlingImage()}
                          alt={seedling.seedling_type}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
                          }}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Classification Badge */}
                        <span className="absolute top-1.5 left-1.5 lg:top-2 lg:left-2 bg-green-800 text-white text-[10px] lg:text-xs font-semibold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded">
                          {seedling.classification === 'Crafted' ? 'Grafted' : seedling.classification}
                        </span>

                        {/* Low Stock Badge */}
                        {isLowStock && !isOutOfStock && (
                          <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 bg-orange-500 text-white text-[10px] lg:text-xs font-semibold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded">
                            Low Stock
                          </span>
                        )}
                      </div>
                      
                      {/* Responsive Content */}
                      <CardContent className="p-2.5 lg:p-4">
                        <h3 className="font-bold text-gray-900 text-xs lg:text-base leading-tight mb-0.5 lg:mb-1">
                          {seedling.seedling_type}
                        </h3>
                        
                        <p className="text-[10px] lg:text-sm text-gray-600 mb-1.5 lg:mb-2">
                          Available: <span className="font-semibold">{seedling.total_quantity}</span> pcs
                        </p>
                        
                        {/* Price and Stock Status */}
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                          <div className="flex items-baseline gap-0.5 lg:gap-1">
                            <span className="font-bold text-green-600 text-sm lg:text-lg">
                              ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
                            </span>
                            <span className="text-[9px] lg:text-xs text-gray-400">/ pc</span>
                          </div>
                          <span className={`text-[10px] lg:text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                          </span>
                        </div>
                        
                        {/* Compact Buttons */}
                        <div className="space-y-1.5 lg:space-y-2">
                          <Button
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium h-8 lg:h-10 text-[11px] lg:text-sm"
                            onClick={() => addToCart(seedling)}
                            disabled={isOutOfStock}
                          >
                            <ShoppingCart className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full border-green-700 text-green-700 hover:bg-green-50 font-medium h-8 lg:h-10 text-[11px] lg:text-sm"
                            onClick={() => {
                              setSelectedSeedling(seedling);
                              setShowRequestDialog(true);
                            }}
                            disabled={isOutOfStock}
                          >
                            <svg className="w-3 lg:w-4 h-3 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
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

      {/* Quick Request Dialog */}
      <QuickRequestDialog
        isOpen={showRequestDialog}
        onClose={() => {
          setShowRequestDialog(false);
          setSelectedSeedling(null);
        }}
        seedling={selectedSeedling}
      />
    </div>
  );
};

export default Shop;
