import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/helpers';
import { FiStar, FiShoppingCart, FiCheck, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then(({ data }) => {
      setData(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to review');
    try {
      await api.post(`/products/${data.product._id}/reviews`, review);
      toast.success('Review submitted!');
      const res = await api.get(`/products/${slug}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const { product, reviews, related } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link> / <Link to="/products" className="hover:text-primary-600">Products</Link> / <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full" style={{ backgroundColor: product.colorHex || '#ccc' }} />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-primary-600 font-medium uppercase tracking-wider">{product.brand || product.category}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <FiStar key={i} className={`w-5 h-5 ${i <= Math.round(product.rating) ? 'text-gold-500 fill-current' : 'text-gray-300'}`} />)}
            </div>
            <span className="text-sm font-medium">{product.rating?.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
          </div>

          {product.colorHex && (
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200" style={{ backgroundColor: product.colorHex }} />
              <div>
                <p className="font-medium text-gray-900">{product.color}</p>
                <p className="text-xs text-gray-500">{product.finish} Finish</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through ml-3">{formatPrice(product.comparePrice)}</span>
            )}
            <p className="text-sm text-gray-500 mt-1">Prices in Ghana Cedis (GHS)</p>
          </div>

          {product.description && (
            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          )}

          {product.usage?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Best Used For</h3>
              <div className="flex flex-wrap gap-2">
                {product.usage.map((u, i) => <span key={i} className="badge bg-primary-50 text-primary-700">{u}</span>)}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium text-lg">-</button>
              <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium text-lg">+</button>
            </div>
            <button onClick={() => { addToCart(product, qty); toast.success('Added to cart!'); }} className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg">
              <FiShoppingCart /> Add to Cart
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <FiTruck className="text-green-500" />
            {product.stock > 0 ? (
              <span>In stock ({product.stock} available) — Free delivery on orders above GH₵ 200</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>

          {product.features?.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="space-y-1">
                {product.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><FiCheck className="w-4 h-4 text-green-500" />{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Design Inspirations */}
      {product.designInspirations?.length > 0 && (
        <section className="mb-16">
          <h2 className="section-title">Design Inspirations</h2>
          <p className="section-subtitle">See how this color looks in real spaces</p>
          <div className="grid md:grid-cols-3 gap-6">
            {product.designInspirations.map((d, i) => (
              <div key={i} className="card">
                <div className="aspect-video bg-gray-100">
                  {d.image ? <img src={d.image} alt={d.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 rounded-full" style={{ backgroundColor: product.colorHex }} /></div>}
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

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="section-title">Customer Reviews</h2>
        <p className="section-subtitle">{reviews?.length || 0} reviews</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {reviews?.length > 0 ? reviews.map((r) => (
              <div key={r._id} className="mb-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}
                  <div>
                    <p className="font-medium text-sm">{r.user?.name}</p>
                    <div className="flex items-center gap-1">{Array.from({length: r.rating}, (_,i) => <FiStar key={i} className="w-3 h-3 text-gold-500 fill-current" />)}</div>
                  </div>
                </div>
                {r.title && <p className="font-semibold text-sm mb-1">{r.title}</p>}
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            )) : <p className="text-gray-500">No reviews yet</p>}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex gap-1">{[1,2,3,4,5].map(i => <button key={i} type="button" onClick={() => setReview({...review, rating: i})}><FiStar className={`w-6 h-6 ${i <= review.rating ? 'text-gold-500 fill-current' : 'text-gray-300'} hover:text-gold-400`} /></button>)}</div>
                </div>
                <input type="text" placeholder="Review title" value={review.title} onChange={(e) => setReview({...review, title: e.target.value})} className="input-field" />
                <textarea placeholder="Your review" value={review.comment} onChange={(e) => setReview({...review, comment: e.target.value})} className="input-field h-24 resize-none" />
                <button type="submit" className="btn-primary">Submit Review</button>
              </form>
            ) : (
              <p className="text-gray-500">Please <Link to="/login" className="text-primary-600 font-medium">sign in</Link> to write a review</p>
            )}
          </div>
        </div>
      </section>

      {related?.length > 0 && (
        <section>
          <h2 className="section-title">Related Products</h2>
          <p className="section-subtitle">You might also like</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
