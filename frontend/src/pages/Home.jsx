import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiArrowRight } from 'react-icons/fi';
import { colorFamilies, formatPrice } from '../utils/helpers';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => setFeatured(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const heroCategories = [
    { name: 'Interior', img: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400', color: 'from-blue-500 to-blue-700' },
    { name: 'Exterior', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', color: 'from-green-500 to-green-700' },
    { name: 'Wood', img: 'https://images.unsplash.com/photo-1582063289852-62e3ba5617ba?w=400', color: 'from-amber-600 to-amber-800' },
    { name: 'Metal', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', color: 'from-gray-500 to-gray-700' }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <span className="bg-primary-500/20 text-primary-200 px-4 py-2 rounded-full text-sm font-medium">🇬🇭 Ghana's #1 Paint Marketplace</span>
              <h1 className="text-4xl md:text-6xl font-extrabold mt-6 leading-tight">
                Transform Your<br />
                <span className="bg-gradient-to-r from-gold-400 to-gold-200 text-transparent bg-clip-text">Space with Color</span>
              </h1>
              <p className="text-lg text-primary-100 mt-4 max-w-lg">
                Discover premium paints from top brands. Get inspired by colors, see design ideas, and enjoy free delivery on orders above GH₵ 200.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/products" className="btn-gold text-lg px-8 py-4 inline-flex items-center gap-2">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/colors" className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  Explore Colors
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-primary-200">
                <span>✓ 500+ Products</span>
                <span>✓ Free Delivery*</span>
                <span>✓ Pay on Delivery</span>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 animate-fadeIn">
              {heroCategories.map((cat) => (
                <Link key={cat.name} to={`/products?category=${cat.name}%20Paint`} className={`relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br ${cat.color} group`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute bottom-4 left-4 text-white font-bold text-lg">{cat.name}</span>
                  <img src={cat.img} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above GH₵ 200' },
            { icon: FiShield, title: 'Quality Guaranteed', desc: '100% authentic paints' },
            { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: FiHeadphones, title: '24/7 Support', desc: 'We are here to help' }
          ].map((feat) => (
            <div key={feat.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <feat.icon className="w-8 h-8 text-primary-600" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{feat.title}</p>
                <p className="text-xs text-gray-500">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle mb-0">Popular picks from our collection</p>
          </div>
          <Link to="/products" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
            View All <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="card p-4"><div className="aspect-square bg-gray-100 rounded-lg animate-pulse mb-4" /><div className="h-4 bg-gray-100 rounded animate-pulse mb-2" /><div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>

      {/* Color Families */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Browse by Color</h2>
            <p className="section-subtitle">Find your perfect shade</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {colorFamilies.map((fam) => (
              <Link key={fam.name} to={`/colors?family=${fam.name}`} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-200 group-hover:border-gray-400 transition-all group-hover:scale-110 shadow-sm" style={{ backgroundColor: fam.hex }} />
                <span className="text-xs text-gray-600 font-medium text-center">{fam.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">Browse our extensive collection of paints and get inspired by real design ideas.</p>
          <Link to="/products" className="bg-white text-primary-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all inline-block">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
