import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Sprout,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
  Menu,
  User,
  LogOut,
  Package,
  FileText,
  Loader2,
  X,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import requestService from '@/services/requestService';
import { toast } from 'sonner';

const RequestPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [seedlings, setSeedlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestedDate, setRequestedDate] = useState();
  const [quantities, setQuantities] = useState({});

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

  const categories = ['All', ...new Set(seedlings.map((s) => s.seedling_type))];

  const filteredSeedlings = seedlings.filter((seedling) => {
    const matchesSearch = seedling.seedling_type
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || seedling.seedling_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCardQty = (id) => quantities[id] ?? 1;

  const incrementCardQty = (seedling) => {
    const current = getCardQty(seedling.id);
    if (current < seedling.total_quantity) {
      setQuantities(prev => ({ ...prev, [seedling.id]: current + 1 }));
    }
  };

  const decrementCardQty = (id) => {
    const current = getCardQty(id);
    if (current > 1) setQuantities(prev => ({ ...prev, [id]: current - 1 }));
  };

  const addToCart = (seedling, quantity = 1) => {
    if (quantity > seedling.total_quantity) {
      toast.error(`Only ${seedling.total_quantity} available for ${seedling.seedling_type}`);
      return;
    }
    const existing = cart.find((item) => item.id === seedling.id);
    if (existing) {
      const newTotal = existing.quantity + quantity;
      if (newTotal > seedling.total_quantity) {
        toast.error(`Cannot add more. Only ${seedling.total_quantity} available for ${seedling.seedling_type}`);
        return;
      }
      setCart(cart.map((item) =>
        item.id === seedling.id ? { ...item, quantity: newTotal } : item
      ));
    } else {
      setCart([...cart, { ...seedling, quantity }]);
    }
    toast.success(`${quantity} ${seedling.seedling_type} added to cart`);
    // Reset card quantity back to 1
    setQuantities(prev => ({ ...prev, [seedling.id]: 1 }));
  };

  const updateQuantity = (id, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.quantity + change;
          if (newQty > item.total_quantity) {
            toast.error(`Only ${item.total_quantity} available for ${item.seedling_type}`);
            return item;
          }
          return { ...item, quantity: Math.max(1, newQty) };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.info('Item removed from cart');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price to pay
  const calculateTotalPrice = () => {
    // Check if user's organization is LGU (Free for LGU)
    const isLGU = user?.organization && user.organization.toUpperCase().includes('LGU');
    
    if (isLGU) {
      return 0; // Free for LGU
    }
    
    // Calculate total for non-LGU
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price_per_unit) * item.quantity);
    }, 0);
  };
  
  const totalPrice = calculateTotalPrice();
  const isLGU = user?.organization && user.organization.toUpperCase().includes('LGU');

  const validateCart = () => {
    const errors = [];
    cart.forEach(item => {
      if (item.quantity > item.total_quantity) {
        errors.push({
          seedling: item.seedling_type,
          requested: item.quantity,
          available: item.total_quantity
        });
      }
    });
    return errors;
  };

  const handleSubmitRequest = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!requestedDate) {
      toast.error('Please select a requested date');
      return;
    }

    // Validate cart before submitting
    const validationErrors = validateCart();
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors
        .map(e => `• ${e.seedling}: requested ${e.requested}, available ${e.available}`)
        .join('\n');
      toast.error(`Cannot submit: stock exceeded\n${errorMessage}`);
      return;
    }

    setSubmitting(true);

    try {
      // Submit each item as a separate request
      const promises = cart.map((item) =>
        requestService.createRequest({
          requester_type: 'client',
          requester_id: user.id,
          seedling_type: item.seedling_type,
          quantity: item.quantity,
          purpose: 'Client request via portal',
          contact_number: user.contact_number,
          requested_date: format(requestedDate, 'yyyy-MM-dd'),
        })
      );

      await Promise.all(promises);
      
      toast.success('Requests submitted successfully!', {
        description: `${cart.length} request(s) created`,
      });
      
      setCart([]);
      setRequestedDate(undefined);
      setCartOpen(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to submit requests');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-green-600 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Browse Seedlings</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-700 relative"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">SeedMIS</h1>
                <p className="text-sm text-gray-600">Client Portal</p>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <Package className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/requests')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 font-medium"
              >
                <FileText className="w-5 h-5" />
                Browse Seedlings
              </button>
            </nav>

            {/* Cart Summary */}
            <div className="p-4 bg-green-50 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cart</span>
                <span className="text-sm font-bold text-green-600">
                  {totalItems} items
                </span>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="bg-white w-64 h-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <Package className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/requests');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Browse Seedlings
                </button>
              </nav>

              <Button
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {/* Search & Filter Bar */}
          <div className="bg-white border-b p-4 sticky top-0 lg:top-0 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search seedlings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter - Desktop */}
                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                  {categories.slice(0, 5).map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? 'bg-green-600 hover:bg-green-700'
                          : ''
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter - Mobile Scrollable */}
              <div className="lg:hidden flex gap-2 overflow-x-auto mt-3 pb-2 -mx-4 px-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Seedlings Grid */}
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Seedlings
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredSeedlings.length} seedlings available
                </p>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredSeedlings.map((seedling) => (
                    <Card
                      key={seedling.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <Sprout className="w-16 h-16 lg:w-20 lg:h-20 text-green-600" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-sm lg:text-base">
                          {seedling.seedling_type}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-bold text-green-600">
                              ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-medium">
                              {seedling.total_quantity?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {/* Quantity selector */}
                        <div className="flex items-center justify-between mt-3 mb-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => decrementCardQty(seedling.id)}
                              disabled={getCardQty(seedling.id) <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {getCardQty(seedling.id)}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => incrementCardQty(seedling)}
                              disabled={getCardQty(seedling.id) >= seedling.total_quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {getCardQty(seedling.id) >= seedling.total_quantity && (
                          <p className="text-xs text-amber-600 mb-1">Max available: {seedling.total_quantity}</p>
                        )}
                        <Button
                          className="w-full mt-4 bg-green-600 hover:bg-green-700"
                          onClick={() => addToCart(seedling, getCardQty(seedling.id))}
                          disabled={seedling.total_quantity === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 bottom-0 w-full lg:w-96 bg-white shadow-xl overflow-y-auto">
            {/* Cart Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Your cart is empty</p>
                  <Button
                    variant="link"
                    className="mt-2 text-green-600"
                    onClick={() => setCartOpen(false)}
                  >
                    Browse seedlings
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                              <Sprout className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 mb-1 truncate">
                                {item.seedling_type}
                              </h3>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">
                                  ₱{parseFloat(item.price_per_unit).toFixed(2)} each
                                </p>
                                <p className="text-sm font-semibold text-green-600">
                                  ₱{(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-medium">{totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Requests:</span>
                          <span className="font-medium">{cart.length}</span>
                        </div>
                        <Separator className="bg-green-200" />
                        {isLGU ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Total to Pay:</span>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">FREE</p>
                                <p className="text-xs text-gray-600 mt-0.5">LGU Organization</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total to Pay:</span>
                            <span className="text-2xl font-bold text-green-600">
                              ₱{totalPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requested Date Picker */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="requested_date" className="text-sm font-medium text-gray-700">
                      Requested Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="requested_date"
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal",
                            !requestedDate && "text-muted-foreground"
                          )}
                        >
                          {requestedDate
                            ? format(requestedDate, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={requestedDate}
                          onSelect={setRequestedDate}
                          disabled={(date) => {
                            // Disable past dates (before today)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;
                            
                            // Disable weekends (Saturday = 6, Sunday = 0)
                            const dayOfWeek = date.getDay();
                            return dayOfWeek === 0 || dayOfWeek === 6;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-gray-500">
                      Select when you need the seedlings (weekdays only)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 h-12 text-base"
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Submit Requests
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPage;
