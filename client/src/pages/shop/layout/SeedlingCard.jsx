import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import QuickRequestDialog from './QuickRequestDialog';

const SeedlingCard = ({ seedling, onAddToCart }) => {
  const isLowStock = seedling.total_quantity <= 50;
  const isOutOfStock = seedling.total_quantity === 0;
  const [showRequestDialog, setShowRequestDialog] = useState(false);

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
    return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
            onClick={() => onAddToCart(seedling)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-green-700 text-green-700 hover:bg-green-50 font-medium h-8 lg:h-10 text-[11px] lg:text-sm"
            onClick={() => setShowRequestDialog(true)}
            disabled={isOutOfStock}
          >
            <svg className="w-3 lg:w-4 h-3 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Request
          </Button>
        </div>
      </CardContent>

      {/* Quick Request Dialog */}
      <QuickRequestDialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        seedling={seedling}
      />
    </Card>
  );
};

export default SeedlingCard;
