import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { colorFamilies } from '../utils/helpers';

export default function Colors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const family = searchParams.get('family') || '';

  useEffect(() => {
    setLoading(true);
    api.get('/colors', { params: { family: family || undefined } }).then(({ data }) => {
      setColors(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [family]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Color Explorer</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Browse our complete color collection. See where each color can be used and explore design inspirations.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button onClick={() => setSearchParams({})} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!family ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {colorFamilies.map((fam) => (
          <button key={fam.name} onClick={() => setSearchParams(family === fam.name ? {} : { family: fam.name })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${family === fam.name ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={family === fam.name ? { backgroundColor: fam.hex } : {}}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fam.hex }} />
            {fam.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="card p-4 animate-pulse"><div className="aspect-square rounded-xl bg-gray-100 mb-3" /><div className="h-4 bg-gray-100 rounded w-2/3" /></div>
          ))}
        </div>
      ) : colors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No colors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colors.map((color) => (
            <Link key={color._id} to={`/colors/${color.hex.replace('#', '')}`} className="card group cursor-pointer">
              <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: color.hex }}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-3 py-1 rounded-full">View</span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate">{color.name}</p>
                <p className="text-xs text-gray-500">{color.hex}</p>
                <p className="text-xs text-gray-400 mt-1">{color.usage?.slice(0, 2).join(', ')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
