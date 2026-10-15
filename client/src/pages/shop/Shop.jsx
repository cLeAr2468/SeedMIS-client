import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ShoppingCart, Sprout } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import requestService from '@/services/requestService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import CategoryFilter from './layout/CategoryFilter';
import SeedlingCard from './layout/SeedlingCard';
import CartDrawer from './layout/CartDrawer';

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seedlings, setSeedlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestedDate, setRequestedDate] = useState();
  const [purpose, setPurpose] = useState('');

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

  const addToCart = (seedling) => {
    const existing = cart.find((item) => item.id === seedling.id);
    if (existing) {
      // Check if adding one more would exceed stock
      if (existing.quantity >= seedling.total_quantity) {
        toast.error(`Cannot add more. Only ${seedling.total_quantity} available in stock.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === seedling.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...seedling, quantity: 1 }]);
    }
    toast.success(`${seedling.seedling_type} added to cart`);
  };

  const updateQuantity = (id, change, isDirectSet = false) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            let newQuantity;
            
            if (isDirectSet) {
              // Direct set (from manual input)
              newQuantity = change;
            } else {
              // Increment/decrement
              newQuantity = item.quantity + change;
            }
            
            // Enforce constraints: min 1, max = total_quantity
            newQuantity = Math.max(1, Math.min(newQuantity, item.total_quantity));
            
            // Show warning if hitting max
            if (newQuantity >= item.total_quantity && change > 0) {
              toast.warning(`Maximum quantity reached for ${item.seedling_type}`);
            }
            
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.info('Item removed from cart');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotalPrice = () => {
    const isLGU = user?.organization && user.organization.toUpperCase().includes('LGU');
    if (isLGU) return 0;
    return cart.reduce((total, item) => {
      return total + parseFloat(item.price_per_unit) * item.quantity;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();
  const isLGU = user?.organization && user.organization.toUpperCase().includes('LGU');

  const handleSubmitRequest = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!requestedDate) {
      toast.error('Please select a requested date');
      return;
    }

    if (!purpose || purpose.trim() === '') {
      toast.error('Please provide a purpose for your request');
      return;
    }

    setSubmitting(true);

    try {
      const promises = cart.map((item) =>
        requestService.createRequest({
          requester_type: 'client',
          requester_id: user.id,
          inventory_id: item.id,
          seedling_type: item.seedling_type, // Send for fallback/display
          quantity: item.quantity,
          purpose: purpose,
          contact_number: user.contact_number,
          requested_date: format(requestedDate, 'yyyy-MM-dd'),
          request_source: 'online',
        })
      );

      await Promise.all(promises);

      toast.success('Requests submitted successfully!', {
        description: `${cart.length} request(s) created`,
      });

      setCart([]);
      setRequestedDate(undefined);
      setPurpose('');
      setCartOpen(false);
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to submit requests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileHeader
        title="Browse Seedlings"
        cartCount={totalItems}
        onCartClick={() => setCartOpen(true)}
        showCart
      />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        {/* Search & Filter Bar */}
        <div className="bg-white border-b p-4 sticky top-14 lg:top-0 z-30">
          <div className="max-w-7xl mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search seedlings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Seedlings Grid */}
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'All' ? 'All Seedlings' : selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredSeedlings.length} {filteredSeedlings.length === 1 ? 'item' : 'items'} available
                </p>
              </div>

              <Button
                className="hidden lg:flex bg-green-600 hover:bg-green-700 relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({totalItems})
              </Button>
            </div>

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
                {filteredSeedlings.map((seedling) => (
                  <SeedlingCard
                    key={seedling.id}
                    seedling={seedling}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        isLGU={isLGU}
        requestedDate={requestedDate}
        onDateChange={setRequestedDate}
        purpose={purpose}
        onPurposeChange={setPurpose}
        onSubmit={handleSubmitRequest}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default Shop;
