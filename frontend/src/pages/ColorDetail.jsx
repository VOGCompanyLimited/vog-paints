import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function ColorDetail() {
  const { hex } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/colors/${hex}`).then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, [hex]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Color not found</div>;

  const { color, products } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link> / <Link to="/colors" className="hover:text-primary-600">Colors</Link> / <span className="text-gray-900">{color.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div className="aspect-square rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: color.hex }}>
          <div className="h-full flex flex-col justify-end p-8 bg-gradient-to-t from-black/40 to-transparent">
            <p className="text-white/80 text-sm">Click to copy</p>
            <p className="text-white text-2xl font-mono font-bold">{color.hex}</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{color.name}</h1>
          <p className="text-gray-500 mt-2">{color.family} Family</p>
          {color.description && <p className="text-gray-600 mt-4 leading-relaxed">{color.description}</p>}

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Where to Use</h3>
            <div className="flex flex-wrap gap-2">
              {color.usage?.map((u, i) => <span key={i} className="badge bg-primary-50 text-primary-700">{u}</span>)}
            </div>
          </div>

          {color.mood?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Mood & Feel</h3>
              <div className="flex flex-wrap gap-2">{color.mood.map((m, i) => <span key={i} className="badge bg-purple-50 text-purple-700">{m}</span>)}</div>
            </div>
          )}

          {color.complementary?.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Complementary Colors</h3>
              <div className="flex gap-3">
                {color.complementary.map((c, i) => (
                  <Link key={i} to={`/colors/${c.replace('#', '')}`} className="w-12 h-12 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {color.designs?.length > 0 && (
        <section className="mb-16">
          <h2 className="section-title">Design Inspirations</h2>
          <p className="section-subtitle">See how this color transforms real spaces</p>
          <div className="grid md:grid-cols-3 gap-6">
            {color.designs.map((d, i) => (
              <div key={i} className="card">
                <div className="aspect-video bg-gray-100">
                  {d.image ? <img src={d.image} alt={d.title} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                      <span className="text-white font-semibold opacity-60">{d.roomType}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-600 font-medium uppercase">{d.roomType}</p>
                  <h3 className="font-semibold text-gray-900">{d.title}</h3>
                  {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {products?.length > 0 && (
        <section>
          <h2 className="section-title">Available in {color.name}</h2>
          <p className="section-subtitle">Products available in this color</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
