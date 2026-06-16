import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiDroplet, FiCheck } from 'react-icons/fi';

const FAMILIES = ['Reds', 'Pinks', 'Oranges', 'Yellows', 'Greens', 'Blues', 'Purples', 'Neutrals', 'Whites', 'Browns', 'Blacks'];
const CATEGORIES = ['interior', 'exterior', 'wood', 'metal'];
const CATEGORY_LABELS = { interior: 'Interior', exterior: 'Exterior', wood: 'Wood', metal: 'Metal' };
const CATEGORY_COLORS = { interior: 'bg-blue-100 text-blue-700', exterior: 'bg-green-100 text-green-700', wood: 'bg-amber-100 text-amber-700', metal: 'bg-gray-100 text-gray-700' };

export default function AdminColors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingColor, setEditingColor] = useState(null);
  const [editForm, setEditForm] = useState({ categories: [] });
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', family: 'Reds', categories: ['interior', 'exterior', 'wood', 'metal'] });

  const [mixSlots, setMixSlots] = useState([
    { id: 1, color: null, proportion: 1 },
    { id: 2, color: null, proportion: 1 },
  ]);
  const [mixResult, setMixResult] = useState(null);
  const [mixing, setMixing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadColors();
  }, [user]);

  const loadColors = async () => {
    try {
      const { data } = await api.get('/admin/colors');
      setColors(data);
    } catch (err) { toast.error('Failed to load colors'); }
    finally { setLoading(false); }
  };

  const addColor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/colors', newColor);
      toast.success('Color added');
      setNewColor({ name: '', hex: '#000000', family: 'Reds', categories: ['interior', 'exterior', 'wood', 'metal'] });
      loadColors();
    } catch (err) { toast.error('Failed to add color'); }
  };

  const deleteColor = async (id) => {
    if (!confirm('Delete this color?')) return;
    try {
      await api.delete(`/admin/colors/${id}`);
      toast.success('Color deleted');
      loadColors();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const startEdit = (c) => {
    setEditingColor(c._id);
    setEditForm({ name: c.name, hex: c.hex, family: c.family, categories: c.categories || [] });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/colors/${editingColor}`, editForm);
      toast.success('Color updated');
      setEditingColor(null);
      loadColors();
    } catch (err) { toast.error('Failed to update'); }
  };

  const toggleCategory = (cats, cat) => {
    return cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat];
  };

  const addMixSlot = () => {
    if (mixSlots.length >= 6) return toast.error('Maximum 6 colors');
    setMixSlots([...mixSlots, { id: Date.now(), color: null, proportion: 1 }]);
  };

  const removeMixSlot = (id) => {
    if (mixSlots.length <= 2) return toast.error('Need at least 2 colors');
    setMixSlots(mixSlots.filter(c => c.id !== id));
  };

  const updateMixColor = (id, colorHex) => {
    const found = colors.find(c => c.hex === colorHex);
    setMixSlots(mixSlots.map(m => m.id === id ? { ...m, color: found || colorHex } : m));
  };

  const mix = async () => {
    const valid = mixSlots.filter(m => m.color);
    if (valid.length < 2) return toast.error('Select at least 2 colors');
    try {
      setMixing(true);
      const payload = {
        colors: valid.map(m => ({
          rgb: m.color.rgb || hexToRgb(m.color),
          proportion: Number(m.proportion) || 1
        }))
      };
      const { data } = await api.post('/admin/colors/mix', payload);
      setMixResult(data);
    } catch (err) { toast.error('Mix failed'); }
    finally { setMixing(false); }
  };

  const addMixToDatabase = async () => {
    if (!mixResult) return;
    try {
      await api.post('/admin/colors', {
        name: `${mixSlots.find(m => m.color?.name)?.color?.name || 'Custom'} Mix`,
        hex: mixResult.hex,
        family: 'Custom Mixes',
        categories: ['interior', 'exterior', 'wood', 'metal']
      });
      toast.success('Mixed color saved!');
      loadColors();
    } catch (err) { toast.error('Failed to save'); }
  };

  const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  const filtered = colors.filter(c => {
    if (filter && !c.name.toLowerCase().includes(filter.toLowerCase()) && !c.family?.toLowerCase().includes(filter.toLowerCase()) && !c.hex.includes(filter)) return false;
    if (categoryFilter && !(c.categories || []).includes(categoryFilter)) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, c) => {
    const f = c.family || 'Other';
    if (!acc[f]) acc[f] = [];
    acc[f].push(c);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700 mb-6 inline-block">&larr; Dashboard</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Color Manager</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Color Library */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="text" placeholder="Search colors..." value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field flex-1 min-w-[200px]" />
            <div className="flex gap-1">
              <button onClick={() => setCategoryFilter('')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${!categoryFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${categoryFilter === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>
            <span className="text-sm text-gray-500">{filtered.length} colors</span>
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([family, cols]) => (
              <div key={family} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-700">{family}</h3>
                  <span className="text-xs text-gray-400">{cols.length}</span>
                </div>
                <div className="p-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {cols.map(c => (
                    <div key={c._id} className="group relative">
                      <div className="aspect-square rounded-lg ring-1 ring-gray-200 cursor-pointer transition-transform hover:scale-110 overflow-hidden" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} onClick={() => { navigator.clipboard?.writeText(c.hex); toast('Hex copied!'); }} />
                      {editingColor === c._id ? (
                        <div className="absolute inset-0 bg-white/95 rounded-lg flex flex-col items-center justify-center gap-1 p-1">
                          {CATEGORIES.map(cat => (
                            <label key={cat} className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer ${editForm.categories.includes(cat) ? CATEGORY_COLORS[cat] : 'text-gray-400 bg-gray-50'}`}>
                              <input type="checkbox" checked={editForm.categories.includes(cat)} onChange={() => setEditForm({...editForm, categories: toggleCategory(editForm.categories, cat)})} className="hidden" />
                              {editForm.categories.includes(cat) && <FiCheck className="w-2.5 h-2.5" />}
                              {CATEGORY_LABELS[cat]}
                            </label>
                          ))}
                          <button onClick={saveEdit} className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-medium mt-0.5">Save</button>
                        </div>
                      ) : (
                        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-0.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(c.categories || []).map(cat => (
                            <span key={cat} className={`text-[8px] px-1 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat]}`}>{CATEGORY_LABELS[cat][0]}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-[10px] text-gray-500 truncate flex-1 text-center">{c.name}</p>
                        {!editingColor && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); startEdit(c); }} className="text-[9px] text-primary-500 hover:text-primary-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">cat</button>
                            <button onClick={() => deleteColor(c._id)} className="text-[9px] text-red-500 hover:text-red-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><FiTrash2 className="w-2.5 h-2.5" /></button>
                          </>
                        )}
                      </div>
                      {(c.categories || []).length > 0 && !editingColor && (
                        <div className="flex flex-wrap gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {(c.categories || []).map(cat => (
                            <span key={cat} className={`text-[7px] px-1 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat]}`}>{CATEGORY_LABELS[cat]}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Color */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><FiPlus className="w-4 h-4" /> Add Color</h2>
            <form onSubmit={addColor} className="space-y-2.5">
              <input type="text" placeholder="Color name" value={newColor.name} onChange={(e) => setNewColor({...newColor, name: e.target.value})} className="input-field text-sm" required />
              <div className="flex items-center gap-2">
                <input type="color" value={newColor.hex} onChange={(e) => setNewColor({...newColor, hex: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                <input type="text" value={newColor.hex} onChange={(e) => setNewColor({...newColor, hex: e.target.value})} className="input-field text-sm flex-1 font-mono" required />
              </div>
              <select value={newColor.family} onChange={(e) => setNewColor({...newColor, family: e.target.value})} className="input-field text-sm">
                {FAMILIES.map(f => <option key={f}>{f}</option>)}
              </select>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">Suitable for</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${newColor.categories.includes(cat) ? CATEGORY_COLORS[cat] : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                      <input type="checkbox" checked={newColor.categories.includes(cat)} onChange={() => setNewColor({...newColor, categories: toggleCategory(newColor.categories, cat)})} className="hidden" />
                      {newColor.categories.includes(cat) && <FiCheck className="w-3 h-3" />}
                      {CATEGORY_LABELS[cat]}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary text-sm w-full">Add Color</button>
            </form>
          </div>

          {/* Color Mixer */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><FiDroplet className="w-4 h-4" /> Color Mixer</h2>
            <p className="text-xs text-gray-500 mb-3">Mix up to 6 colors</p>

            <div className="space-y-2.5">
              {mixSlots.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <select className="input-field text-sm flex-1" value={m.color?.hex || ''} onChange={(e) => updateMixColor(m.id, e.target.value)}>
                    <option value="">Select color...</option>
                    {colors.filter(c => !mixSlots.some(mc => mc.id !== m.id && mc.color?.hex === c.hex)).map(c => (
                      <option key={c._id} value={c.hex}>{c.name}</option>
                    ))}
                  </select>
                  <input type="number" min="0.1" step="0.1" value={m.proportion} onChange={(e) => setMixSlots(mixSlots.map(mc => mc.id === m.id ? {...mc, proportion: Number(e.target.value)} : mc))} className="input-field text-sm w-16 text-center" title="Proportion" />
                  <button type="button" onClick={() => removeMixSlot(m.id)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {mixSlots.length < 6 && (
                <button onClick={addMixSlot} className="text-xs text-primary-600 font-medium hover:text-primary-700">+ Add color</button>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={mix} disabled={mixing} className="btn-primary text-sm flex-1">{mixing ? 'Mixing...' : 'Mix'}</button>
            </div>

            {mixResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl ring-1 ring-gray-200 shrink-0" style={{ backgroundColor: mixResult.hex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-mono">{mixResult.hex}</p>
                    <p className="text-xs text-gray-500">RGB({mixResult.rgb.join(', ')})</p>
                  </div>
                  <button onClick={addMixToDatabase} className="btn-secondary text-xs whitespace-nowrap">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
