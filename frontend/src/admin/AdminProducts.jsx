import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', category: '', color: '', colorHex: '',
    finish: 'Matte', size: '', price: '', comparePrice: '', stock: '',
    description: '', features: '', usage: '', images: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadProducts();
    loadColors();
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data);
    } catch (err) { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const loadColors = async () => {
    try {
      const { data } = await api.get('/admin/colors');
      setAllColors(data);
    } catch (err) {}
  };

  const uploadImages = async (files) => {
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append('images', f);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        features: form.features ? form.features.split('\n').filter(Boolean) : [],
        usage: form.usage ? form.usage.split('\n').filter(Boolean) : []
      };
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setEditing(null);
      setForm({ name: '', brand: '', category: '', color: '', colorHex: '', finish: 'Matte', size: '', price: '', comparePrice: '', stock: '', description: '', features: '', usage: '', images: [] });
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const editProduct = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name, brand: p.brand || '', category: p.category, color: p.color || '',
      colorHex: p.colorHex || '', finish: p.finish || 'Matte', size: p.size || '',
      price: p.price.toString(), comparePrice: p.comparePrice?.toString() || '',
      stock: p.stock.toString(), description: p.description || '',
      features: p.features?.join('\n') || '', usage: p.usage?.join('\n') || '',
      images: p.images || []
    });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Dashboard</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Products</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="text-left p-4 font-semibold">Product</th><th className="text-left p-4 font-semibold">Price</th><th className="text-left p-4 font-semibold">Stock</th><th className="text-left p-4 font-semibold">Status</th><th className="text-right p-4 font-semibold">Actions</th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover ring-1 ring-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center ring-1 ring-gray-200" style={{backgroundColor: p.colorHex || '#f3f4f6'}}>
                              <FiImage className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.brand ? `${p.brand} · ` : ''}{p.category}</p>
                            {p.color && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: p.colorHex || '#ccc'}} />{p.color}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{formatPrice(p.price)}</td>
                      <td className="p-4"><span className={p.stock <= 5 ? 'text-red-600 font-medium' : ''}>{p.stock}</span></td>
                      <td className="p-4"><span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => editProduct(p)} className="text-primary-600 hover:text-primary-700 font-medium mr-3">Edit</button>
                        <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
              {form.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="aspect-square rounded-lg bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fileRef.current?.click()}>
                    <FiUpload className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div>
                  <FiUpload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Upload Product Images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadImages(e.target.files)} disabled={uploading} />
              {uploading && <p className="text-xs text-primary-600 mt-2">Uploading...</p>}
            </div>

            <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field text-sm" required />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Brand" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} className="input-field text-sm" />
              <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field text-sm" required />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Color Name" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} className="input-field text-sm flex-1" />
                <div className="flex items-center gap-1.5">
                  <input type="text" placeholder="#ff0000" value={form.colorHex} onChange={(e) => setForm({...form, colorHex: e.target.value})} className="input-field text-sm w-24 font-mono" />
                  {form.colorHex && <div className="w-7 h-7 rounded-lg shrink-0 ring-1 ring-gray-200" style={{backgroundColor: form.colorHex}} />}
                </div>
              </div>
              {allColors.length > 0 && form.category && (
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-gray-50 rounded-lg">
                  {allColors.filter(c => !c.categories || c.categories.length === 0 || c.categories.includes(form.category.toLowerCase())).map(c => (
                    <button key={c._id} type="button" onClick={() => setForm({...form, color: c.name, colorHex: c.hex})} className={`w-7 h-7 rounded-lg ring-1 ring-gray-200 shrink-0 transition-transform hover:scale-110 ${form.colorHex === c.hex ? 'ring-2 ring-primary-600 scale-110' : ''}`} style={{backgroundColor: c.hex}} title={c.name} />
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={form.finish} onChange={(e) => setForm({...form, finish: e.target.value})} className="input-field text-sm"><option>Matte</option><option>Gloss</option><option>Satin</option><option>Eggshell</option><option>Semi-Gloss</option></select>
              <input type="text" placeholder="Size" value={form.size} onChange={(e) => setForm({...form, size: e.target.value})} className="input-field text-sm" />
              <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="input-field text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.01" placeholder="Price (GHS)" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="input-field text-sm" required />
              <input type="number" step="0.01" placeholder="Compare Price" value={form.comparePrice} onChange={(e) => setForm({...form, comparePrice: e.target.value})} className="input-field text-sm" />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field text-sm h-20 resize-none" />
            <textarea placeholder="Usage (one per line)" value={form.usage} onChange={(e) => setForm({...form, usage: e.target.value})} className="input-field text-sm h-16 resize-none" />
            <textarea placeholder="Features (one per line)" value={form.features} onChange={(e) => setForm({...form, features: e.target.value})} className="input-field text-sm h-16 resize-none" />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 text-sm">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
