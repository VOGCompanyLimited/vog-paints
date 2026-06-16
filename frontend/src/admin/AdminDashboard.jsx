import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPrice, getStatusColor } from '../utils/helpers';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiDroplet } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    api.get('/admin/dashboard').then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: FiPackage, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), icon: FiDollarSign, color: 'bg-green-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'bg-purple-500' },
    { label: 'Total Products', value: stats.totalProducts, icon: FiShoppingBag, color: 'bg-orange-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-secondary text-sm">Products</Link>
          <Link to="/admin/orders" className="btn-secondary text-sm">Orders</Link>
          <Link to="/admin/users" className="btn-secondary text-sm">Users</Link>
          <Link to="/admin/colors" className="btn-secondary text-sm"><FiDroplet className="w-3.5 h-3.5 inline mr-1" />Colors</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data?.recentOrders?.map((order) => (
              <Link key={order._id} to="/admin/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.user?.name}</p>
                </div>
                <span className={`badge ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {data?.ordersByStatus?.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <span className="text-sm capitalize">{s._id.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${(s.count / stats.totalOrders) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
