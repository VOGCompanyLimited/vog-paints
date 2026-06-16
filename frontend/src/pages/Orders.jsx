import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getStatusColor } from '../utils/helpers';
import { FiPackage } from 'react-icons/fi';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500">{order.items?.length || 0} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                {order.items?.slice(0, 5).map((item, i) => (
                  item.image ? <img key={i} src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" /> :
                  <div key={i} className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center"><div className="w-4 h-4 rounded-full" style={{backgroundColor: item.color || '#ccc'}} /></div>
                ))}
                {order.items?.length > 5 && <span className="text-xs text-gray-400">+{order.items.length - 5} more</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
