import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Calendar, Package, Edit2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import requestService from '@/services/requestService';
import EditRequestModal from './EditRequestModal';
import CancelRequestDialog from './CancelRequestDialog';

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
  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
};

const OrderCard = ({ order, onOrderUpdated }) => {
  const config = statusConfig[order.status] || statusConfig.Pending;
  const [isCanceling, setIsCanceling] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async (orderId, reason) => {
    setIsCanceling(true);
    try {
      const response = await requestService.cancelRequest(orderId, reason);
      if (response.success) {
        toast.success('Request cancelled successfully');
        if (onOrderUpdated) onOrderUpdated();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel request';
      toast.error(errorMessage);
      throw error; // Re-throw to let dialog handle it
    } finally {
      setIsCanceling(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    if (onOrderUpdated) onOrderUpdated();
  };

  const isPending = order.status === 'Pending';

  return (
    <>
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
                
                {/* Rejection Reason */}
                {order.status === 'Rejected' && order.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                    <p className="text-xs text-red-600">{order.rejection_reason}</p>
                    {order.rejected_at && (
                      <p className="text-xs text-red-500 mt-2">
                        Rejected on: {new Date(order.rejected_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Cancellation Reason */}
                {order.status === 'Cancelled' && order.cancellation_reason && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Cancellation Reason:</p>
                    <p className="text-xs text-gray-600">{order.cancellation_reason}</p>
                    {order.cancelled_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Cancelled on: {new Date(order.cancelled_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                )}

                {/* Released Date */}
                {order.status === 'Released' && order.released_at && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-1">Released Date:</p>
                    <p className="text-xs text-green-600">
                      {new Date(order.released_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Total:</span>
                  <span className="font-bold text-green-600">
                    {order.total_price === 0 ? 'FREE' : `₱${parseFloat(order.total_price).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Only show for Pending status */}
              {isPending && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    onClick={() => setShowEditModal(true)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    size="sm"
                    variant="outline"
                    disabled={isCanceling}
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditRequestModal
          request={order}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <CancelRequestDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          order={order}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default OrderCard;
