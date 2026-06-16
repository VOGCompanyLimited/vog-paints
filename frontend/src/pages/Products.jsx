import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { colorFamilies, finishes } from '../utils/helpers';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const colorFamily = searchParams.get('colorFamily') || '';
  const finish = searchParams.get('finish') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (category) params.category = category;
    if (colorFamily) params.colorFamily = colorFamily;
    if (finish) params.finish = finish;
    if (search) params.search = search;
    if (sort) params.sort = sort;

    api.get('/products', { params }).then(({ data }) => {
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [category, colorFamily, finish, search, sort, page]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {category || 'All Products'}
          </h1>
          <p className="text-gray-500">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search paints..."
              value={search} onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field w-auto">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rating</option>
            <option value="name">Name</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2 md:hidden">
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 flex' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
          <div className={`${showFilters ? 'bg-white w-80 h-full p-6 overflow-y-auto' : ''} md:bg-transparent md:p-0`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}><FiX className="w-6 h-6" /></button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Color Family</h4>
                <div className="flex flex-wrap gap-2">
                  {colorFamilies.map((fam) => (
                    <button key={fam.name}
                      onClick={() => updateFilter('colorFamily', colorFamily === fam.name ? '' : fam.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${colorFamily === fam.name ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fam.hex }} />
                      {fam.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Finish</h4>
                <div className="flex flex-wrap gap-2">
                  {finishes.map((f) => (
                    <button key={f}
                      onClick={() => updateFilter('finish', finish === f ? '' : f)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${finish === f ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                    >{f}</button>
                  ))}
                </div>
              </div>

              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear all filters
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="card p-4"><div className="aspect-square bg-gray-100 rounded-lg animate-pulse mb-4" /><div className="h-4 bg-gray-100 rounded animate-pulse mb-2" /><div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" /></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => updateFilter('page', p.toString())}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${p === Number(page) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
