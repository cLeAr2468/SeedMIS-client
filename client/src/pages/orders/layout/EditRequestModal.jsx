import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import requestService from '@/services/requestService';

const EditRequestModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [requestedDate, setRequestedDate] = useState(() => {
    // Parse the existing date from the request
    if (request.requested_date) {
      return new Date(request.requested_date);
    }
    return new Date();
  });
  const [formData, setFormData] = useState({
    seedling_type: request.seedling_type || '',
    quantity: request.quantity || 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.seedling_type) {
      toast.error('Please select a seedling type');
      return;
    }

    if (formData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (!requestedDate) {
      toast.error('Please select a requested date');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        ...formData,
        requested_date: format(requestedDate, 'yyyy-MM-dd')
      };
      const response = await requestService.updateRequest(request.id, updateData);
      if (response.success) {
        toast.success('Request updated successfully');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 isolate z-50 bg-black/20 duration-100 supports-backdrop-filter:backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle>Edit Request</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 pb-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">⚠️ Note:</p>
                <p>You can only edit quantity and date. To change the seedling type, please cancel this request and create a new one.</p>
              </div>

              {/* Seedling Type - Disabled */}
              <div className="space-y-2">
                <Label htmlFor="seedling_type">Seedling Type</Label>
                <select
                  id="seedling_type"
                  name="seedling_type"
                  value={formData.seedling_type}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                >
                  <option value={formData.seedling_type}>{formData.seedling_type}</option>
                </select>
                <p className="text-xs text-gray-500">Seedling type cannot be changed</p>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              {/* Requested Date */}
              <div className="space-y-2">
                <Label htmlFor="requested_date">Requested Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="requested_date"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-11",
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
                      onSelect={setRequestedDate}
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
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditRequestModal;
