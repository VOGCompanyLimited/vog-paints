import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/users').then(({ data }) => setUsers(data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update role'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Dashboard</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Phone</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-xs font-bold text-primary-600">{u.name?.[0]}</span></div>}
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 text-gray-500">{u.phone || '-'}</td>
                  <td className="p-4">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'delivery' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {u.role === 'admin' ? (
                      <span className="text-xs text-purple-600 font-medium">Permanent</span>
                    ) : (
                      <select className="text-xs border border-gray-200 rounded-lg p-1.5" value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}>
                        <option value="customer">Customer</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    )}
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
