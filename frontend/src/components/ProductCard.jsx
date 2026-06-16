import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const path = product._id ? product._id : product.slug;

  return (
    <div className="card group animate-fadeIn">
      <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full" style={{ backgroundColor: product.colorHex || '#ccc' }} />
          </div>
        )}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 right-3 bg-gold-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brand || product.category}</p>
        <Link to={`/products/${product.slug}`} className="block font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
          {product.name}
        </Link>
        {product.colorHex && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: product.colorHex }} />
            <span className="text-xs text-gray-500">{product.color}</span>
          </div>
        )}
        <div className="flex items-center gap-1 mt-2">
          <FiStar className="w-4 h-4 text-gold-500 fill-current" />
          <span className="text-sm font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <button onClick={(e) => { e.preventDefault(); addToCart(product, 1); }} className="p-2.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all">
            <FiShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
