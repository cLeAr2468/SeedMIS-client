import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import requestService from '@/services/requestService';
import CartDrawer from '@/pages/shop/layout/CartDrawer';

const GlobalCartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    calculateTotalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [requestedDate, setRequestedDate] = useState();
  const [purpose, setPurpose] = useState('');

  const totalPrice = calculateTotalPrice(user);
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
          seedling_type: item.seedling_type,
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

      clearCart();
      setRequestedDate(undefined);
      setPurpose('');
      closeCart();
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to submit requests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CartDrawer
      isOpen={isCartOpen}
      onClose={closeCart}
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
  );
};

export default GlobalCartDrawer;
