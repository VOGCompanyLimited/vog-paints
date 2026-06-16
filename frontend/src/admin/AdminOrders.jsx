import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPrice, getStatusColor, getPaymentStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryPartners, setDeliveryPartners] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadOrders();
    api.get('/admin/delivery-partners').then(({ data }) => setDeliveryPartners(data)).catch(() => {});
  }, [user, statusFilter]);

  const loadOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.orders);
    } catch (err) { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status, deliveryPartnerId) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status, deliveryPartnerId });
      toast.success('Order updated');
      loadOrders();
    } catch (err) { toast.error('Failed to update order'); }
  };

  const confirmPayment = async (orderId) => {
    const ref = prompt('Enter payment reference:');
    if (!ref) return;
    try {
      await api.put(`/orders/${orderId}/confirm-payment`, { reference: ref });
      toast.success('Payment confirmed');
      loadOrders();
    } catch (err) { toast.error('Failed to confirm payment'); }
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Dashboard</Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{s.replace(/_/g, ' ')}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Items</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Payment</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Delivery Partner</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.phone}</p>
                  </td>
                  <td className="p-4">{order.items?.length} item(s)</td>
                  <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className={`badge ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="p-4">
                    <select className="text-xs border border-gray-200 rounded-lg p-1" value={order.deliveryPartner?._id || ''} onChange={(e) => updateStatus(order._id, order.status, e.target.value)}>
                      <option value="">Assign...</option>
                      {deliveryPartners.map((dp) => <option key={dp._id} value={dp._id}>{dp.name}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending' && (
                        <button onClick={() => confirmPayment(order._id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">Confirm Payment</button>
                      )}
                      {statuses.indexOf(order.status) < statuses.indexOf('delivered') && (
                        <select className="text-xs border border-gray-200 rounded-lg p-1" value="" onChange={(e) => { if (e.target.value) updateStatus(order._id, e.target.value, null); }}>
                          <option value="">Update Status</option>
                          {statuses.slice(statuses.indexOf(order.status) + 1, statuses.indexOf('delivered') + 1).map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button onClick={() => updateStatus(order._id, 'cancelled', null)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-200">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
