import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPrice, getStatusColor, getPaymentStatusColor } from '../utils/helpers';
import { FiMapPin, FiPackage, FiTruck, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const timeline = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = timeline.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Back to Orders</Link>
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge text-sm ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
            <span className={`badge text-sm ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-start justify-between mb-8 overflow-x-auto py-4">
          {timeline.map((step, i) => (
            <div key={step} className="flex flex-col items-center min-w-[80px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'} ${i === currentStep && step !== 'delivered' && step !== 'cancelled' ? 'ring-4 ring-primary-200' : ''}`}>
                {i < currentStep ? <FiCheck /> : i === currentStep && order.status === 'cancelled' ? <FiX /> : i + 1}
              </div>
              <p className={`text-xs mt-2 text-center font-medium ${i <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>{step.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FiMapPin className="text-primary-600" /> Delivery Address</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <p className="text-sm text-gray-600 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
            {order.bankPaymentDetails?.reference && <p className="text-sm text-gray-500">Ref: {order.bankPaymentDetails.reference}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 rounded-full" style={{backgroundColor: item.color}} /></div>}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking */}
      {order.tracking?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Tracking Updates</h2>
          <div className="space-y-4">
            {order.tracking.slice().reverse().map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium capitalize">{t.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString('en-GH')}</p>
                  {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{order.deliveryFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(order.deliveryFee)}</span></div>
          <hr />
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
        {['pending', 'confirmed'].includes(order.status) && (
          <button onClick={cancelOrder} className="btn-secondary w-full mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
