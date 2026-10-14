import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import requestService from '@/services/requestService';

const EditRequestModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [availableSeedlings, setAvailableSeedlings] = useState([]);
  const [formData, setFormData] = useState({
    seedling_type: request.seedling_type || '',
    quantity: request.quantity || 1,
    requested_date: request.requested_date || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAvailableSeedlings();
  }, []);

  const fetchAvailableSeedlings = async () => {
    try {
      const response = await requestService.getAvailableSeedlings();
      if (response.success) {
        setAvailableSeedlings(response.data);
      }
    } catch (error) {
      console.error('Error fetching seedlings:', error);
    }
  };

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
              {/* Seedling Type */}
              <div className="space-y-2">
                <Label htmlFor="seedling_type">Seedling Type</Label>
                <select
                  id="seedling_type"
                  name="seedling_type"
                  value={formData.seedling_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="">Select seedling type</option>
                  {availableSeedlings.map((seedling) => (
                    <option key={seedling.id} value={seedling.seedling_type}>
                      {seedling.seedling_type} ({seedling.total_available_quantity} available)
                    </option>
                  ))}
                </select>
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
