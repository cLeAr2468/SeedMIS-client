import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import requestService from '@/services/requestService';
import { cn } from '@/lib/utils';

const QuickRequestDialog = ({ isOpen, onClose, seedling }) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setQuantity(1);
    setPurpose('');
    setScheduleDate(null);
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!quantity || quantity < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!purpose.trim()) {
      toast.error('Please enter the purpose of request');
      return;
    }

    if (!scheduleDate) {
      toast.error('Please select a schedule date');
      return;
    }

    if (quantity > seedling.total_quantity) {
      toast.error(`Only ${seedling.total_quantity} items available`);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        requester_id: Number(user.id),  // Added requester_id
        client_id: Number(user.id),
        inventory_id: Number(seedling.id),
        seedling_type: String(seedling.seedling_type),
        quantity: Number(quantity),
        price_per_unit: Number(seedling.price_per_unit),
        total_price: Number(quantity) * Number(seedling.price_per_unit),
        purpose: String(purpose.trim()),
        requested_date: format(scheduleDate, 'yyyy-MM-dd'),
        request_source: 'online',
        requester_type: 'client',
        status: 'Pending',
      };

      console.log('📤 Submitting request:', requestData);

      const response = await requestService.createRequest(requestData);

      console.log('✅ Response:', response);

      if (response.success) {
        toast.success('Request submitted successfully!');
        handleClose();
      } else {
        toast.error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('❌ Request submission error:', error);
      
      // Show detailed error message
      let errorMessage = 'Failed to submit request';
      
      // The error is already the response data from requestService
      if (error.errors) {
        // Laravel validation errors
        const errorFields = Object.keys(error.errors);
        const firstError = error.errors[errorFields[0]][0]; // Get first error message
        errorMessage = `Validation failed: ${firstError}`;
        console.error('Validation errors:', error.errors);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seedling) return null;

  const totalPrice = quantity * parseFloat(seedling.price_per_unit);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Quick Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seedling Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src={
                    seedling.image_url?.startsWith('http')
                      ? seedling.image_url
                      : `${window.location.hostname !== 'localhost' 
                          ? 'https://seedmis-server-production.up.railway.app' 
                          : 'http://localhost:8000'}/${seedling.image_url}`
                  }
                  alt={seedling.seedling_type}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400';
                  }}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {seedling.seedling_type}
                </h3>
                <p className="text-sm text-gray-600">
                  ₱{parseFloat(seedling.price_per_unit).toFixed(2)} / pc
                </p>
                <p className="text-xs text-gray-500">
                  Available: {seedling.total_quantity} pcs
                </p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={seedling.total_quantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), seedling.total_quantity));
                }}
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(seedling.total_quantity, quantity + 1))}
                disabled={quantity >= seedling.total_quantity}
              >
                +
              </Button>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">
              Purpose <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purpose"
              placeholder="e.g., Personal planting, Community project..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* Schedule Date */}
          <div className="space-y-2">
            <Label>
              Schedule Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !scheduleDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Total Price */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickRequestDialog;
