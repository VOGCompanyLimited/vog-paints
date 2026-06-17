import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';

export default function AdminLogo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [logo, setLogo] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadLogo();
  }, [user]);

  const loadLogo = async () => {
    try {
      const { data } = await api.get('/admin/logo');
      setLogo(data.logo || null);
    } catch { setLogo(null); }
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    const fd = new FormData();
    fd.append('images', files[0]);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', fd);
      await api.put('/admin/logo', { url: data.urls[0] });
      setLogo(data.url);
      toast.success('Logo updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      await api.delete('/admin/logo');
      setLogo(null);
      toast.success('Logo removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="/admin" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Dashboard</a>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Logo Settings</h1>

      <div className="max-w-md bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm text-gray-500 mb-4">Upload your company logo (PNG, JPG, WebP). Recommended size: 400x200px.</p>

        {logo ? (
          <div className="relative inline-block group">
            <img src={logo} alt="Logo" className="max-h-24 rounded-lg ring-1 ring-gray-200" />
            <button onClick={removeLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => fileRef.current?.click()}>
            <FiUpload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Click to upload logo</p>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
        {uploading && <p className="text-xs text-primary-600 mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
