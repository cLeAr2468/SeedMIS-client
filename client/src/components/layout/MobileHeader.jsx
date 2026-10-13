import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileHeader = ({ title, cartCount = 0, onCartClick, showCart = false }) => {
  return (
    <div className="lg:hidden bg-green-600 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <h1 className="font-bold text-lg">{title}</h1>
      {showCart && (
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-700 relative"
          onClick={onCartClick}
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {cartCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default MobileHeader;
