import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const SeedlingCard = ({ seedling, onAddToCart }) => {
  const isLowStock = seedling.total_quantity <= 50;
  const isOutOfStock = seedling.total_quantity === 0;

  // Construct the full image URL
  const getImageUrl = () => {
    if (!seedling.image_url) return null;
    
    // If image_url is already a full URL (starts with http), use it as is
    if (seedling.image_url.startsWith('http')) {
      return seedling.image_url;
    }
    
    // Otherwise, construct the URL using the backend base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://seedmis-server-production.up.railway.app';
    return `${baseUrl}/storage/${seedling.image_url}`;
  };

  const imageUrl = getImageUrl();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image Section - Fixed aspect ratio */}
      <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={seedling.seedling_type}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          imageUrl && "hidden"
        )}>
          <Sprout className="w-20 h-20 lg:w-24 lg:h-24 text-green-600" />
        </div>
        {isLowStock && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
            Low Stock
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
            Out of Stock
          </span>
        )}
      </div>
      
      {/* Content Section - Auto height */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-3 text-base lg:text-lg line-clamp-2 min-h-[3rem]">
          {seedling.seedling_type}
        </h3>
        
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Price:</span>
            <span className="font-bold text-green-600 text-lg">
              ₱{parseFloat(seedling.price_per_unit).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Stock:</span>
            <span className={cn(
              "font-semibold",
              isLowStock ? "text-orange-600" : "text-gray-900"
            )}>
              {seedling.total_quantity?.toLocaleString()}
            </span>
          </div>
        </div>
        
        <Button
          className="w-full bg-green-600 hover:bg-green-700 h-10"
          onClick={() => onAddToCart(seedling)}
          disabled={isOutOfStock}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeedlingCard;
