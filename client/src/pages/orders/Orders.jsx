import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import OrderCard from './layout/OrderCard';
import OrderFilters from './layout/OrderFilters';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Filter only client orders
        const clientOrders = response.data.data.filter(
          (req) => req.requester_type === 'client' && req.client_id === user?.id
        );
        setOrders(clientOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['All', 'Pending', 'Approved', 'Released', 'Rejected'];

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'All') return true;
    return order.status === selectedStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileHeader title="My Orders" />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        {/* Filters */}
        <div className="bg-white border-b p-4 sticky top-14 lg:top-0 z-30">
          <div className="max-w-7xl mx-auto">
            <OrderFilters
              statuses={statuses}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedStatus === 'All' ? 'All Orders' : `${selectedStatus} Orders`}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {selectedStatus === 'All' ? 'No orders yet' : `No ${selectedStatus.toLowerCase()} orders`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Orders;
