import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import requestService from '@/services/requestService';

const EditRequestModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    seedling_type: request.seedling_type || '',
    quantity: request.quantity || 1,
    requested_date: request.requested_date || new Date().toISOString().split('T')[0],
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

    setLoading(true);

    try {
      const response = await requestService.updateRequest(request.id, formData);
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
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
          <CardContent className="p-6">
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
                <Input
                  id="requested_date"
                  name="requested_date"
                  type="date"
                  value={formData.requested_date}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
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
