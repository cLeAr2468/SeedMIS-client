import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Get user-specific cart key based on current user
  const getCartKey = (currentUser) => {
    return currentUser?.id ? `seedmis_cart_user_${currentUser.id}` : 'seedmis_cart_guest';
  };

  // Load cart from localStorage for specific user
  const loadCartFromStorage = (currentUser) => {
    try {
      const cartKey = getCartKey(currentUser);
      const savedCart = localStorage.getItem(cartKey);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  };

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize cart only after auth is loaded
  useEffect(() => {
    if (!authLoading) {
      const loadedCart = loadCartFromStorage(user);
      setCart(loadedCart);
    }
  }, [authLoading, user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!authLoading && user !== undefined) {
      try {
        const cartKey = getCartKey(user);
        localStorage.setItem(cartKey, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, user?.id, authLoading]);

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

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotalPrice = (user) => {
    const isLGU = user?.organization && user.organization.toUpperCase().includes('LGU');
    if (isLGU) return 0;
    return cart.reduce((total, item) => {
      return total + parseFloat(item.price_per_unit) * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        calculateTotalPrice,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
