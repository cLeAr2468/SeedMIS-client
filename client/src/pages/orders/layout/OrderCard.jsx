import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Calendar, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  Pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  Approved: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  Released: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  Rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const OrderCard = ({ order }) => {
  const config = statusConfig[order.status] || statusConfig.Pending;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sprout className="w-7 h-7 text-green-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {order.seedling_type}
              </h3>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                config.bg,
                config.text
              )}>
                {order.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Quantity: <span className="font-medium text-gray-900">{order.quantity}</span></span>
              </div>
              {order.requested_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(order.requested_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              )}
              {order.request_source && (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.request_source === 'online'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {order.request_source === 'online' ? 'Online' : 'Walk-in'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="font-bold text-green-600">
                  {order.total_price === 0 ? 'FREE' : `₱${parseFloat(order.total_price).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
