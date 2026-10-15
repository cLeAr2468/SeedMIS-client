import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Plus } from 'lucide-react';
import { useState } from 'react';

const SeedlingCard = ({ seedling, onAddToCart }) => {
  const isLowStock = seedling.total_quantity <= 50;
  const isOutOfStock = seedling.total_quantity === 0;
  const [imageError, setImageError] = useState(false);

  // Construct the full image URL (same logic as admin side)
  const getImageUrl = () => {
    if (!seedling.image_url) return null;
    
    // If image_url is already a full URL (starts with http), use it as is
    if (seedling.image_url.startsWith('http')) {
      return seedling.image_url;
    }
    
    // Otherwise, construct the URL: baseURL + imagePath
    // Auto-detect environment
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const baseUrl = isProduction 
      ? 'https://seedmis-server-production.up.railway.app'
      : 'http://localhost:8000';
    
    return `${baseUrl}/${seedling.image_url}`;
  };

  // Determine classification based on seedling type
  const getClassification = () => {
    const type = seedling.seedling_type.toLowerCase();
    if (type.includes('graft')) {
      return { label: 'Grafted', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    return { label: 'Seedling', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  const classification = getClassification();
  const imageUrl = getImageUrl();
  const showImage = imageUrl && !imageError;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col border-2 hover:border-green-200">
      {/* Image Section - Fixed aspect ratio */}
      <div className="aspect-square bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center relative overflow-hidden">
        {showImage ? (
          <img 
            src={imageUrl} 
            alt={seedling.seedling_type}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Sprout className="w-20 h-20 lg:w-24 lg:h-24 text-green-600" />
        )}
        
        {/* Classification Badge - Top Left */}
        <span className={`absolute top-2 left-2 text-xs px-2.5 py-1 rounded-full font-medium border shadow-sm z-10 ${classification.color}`}>
          {classification.label}
        </span>

        {/* Stock Status Badge - Top Right */}
        {isLowStock && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium border border-orange-200 shadow-sm z-10">
            Low Stock
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium border border-red-200 shadow-sm z-10">
            Out of Stock
          </span>
        )}
      </div>
      
      {/* Content Section - Auto height */}
      <CardContent className="p-4 lg:p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-3 text-base lg:text-lg line-clamp-2 min-h-[3rem] leading-tight">
          {seedling.seedling_type}
        </h3>
        
        <div className="space-y-2.5 mb-4 flex-1">
          <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-sm font-medium">Price:</span>
            <span className="font-bold text-green-600 text-lg">
              ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-sm font-medium">Available:</span>
            <span className={`font-semibold text-base ${isLowStock ? "text-orange-600" : "text-gray-900"}`}>
              {seedling.total_quantity?.toLocaleString()}
            </span>
          </div>
        </div>
        
        <Button
          className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-medium shadow-sm hover:shadow-md transition-all"
          onClick={() => onAddToCart(seedling)}
          disabled={isOutOfStock}
        >
          <Plus className="w-5 h-5 mr-2" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeedlingCard;
