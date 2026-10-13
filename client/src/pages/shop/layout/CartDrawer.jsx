import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Sprout,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  Loader2,
  Calendar as CalendarIcon,
  ShoppingCart,
} from 'lucide-react';

const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  totalItems,
  totalPrice,
  isLGU,
  requestedDate,
  onDateChange,
  purpose,
  onPurposeChange,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 bottom-0 w-full lg:w-96 bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Your cart is empty</p>
              <Button
                variant="link"
                className="mt-2 text-green-600"
                onClick={onClose}
              >
                Browse seedlings
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-4">
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                          <Sprout className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
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
                              onClick={() => onUpdateQuantity(item.id, -1)}
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
                              onClick={() => onUpdateQuantity(item.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onRemoveItem(item.id)}
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
              <Card className="bg-green-50 border-green-200 mb-4">
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
                    <div className="border-t border-green-200 pt-3">
                      {isLGU ? (
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Total to Pay:</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">FREE</p>
                            <p className="text-xs text-gray-600">LGU Organization</p>
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
                  </div>
                </CardContent>
              </Card>

              {/* Purpose Input */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                  Purpose <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of this request (e.g., Community Reforestation, School Greening Program)"
                  value={purpose}
                  onChange={(e) => onPurposeChange(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
                <p className="text-xs text-gray-500">
                  Please provide a brief description of how you will use the seedlings
                </p>
              </div>

              {/* Date Picker */}
              <div className="space-y-2 mb-4">
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
                      {requestedDate ? format(requestedDate, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={requestedDate}
                      onSelect={onDateChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;
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
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
  );
};

export default CartDrawer;
