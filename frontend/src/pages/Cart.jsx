import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any paint yet</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <Link to={`/products/${item.slug}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: item.colorHex || '#ccc' }} />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 truncate block">{item.name}</Link>
                {item.color && <p className="text-xs text-gray-500">{item.color}</p>}
                <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-medium">-</button>
                <span className="px-3 py-2 font-semibold min-w-[2.5rem] text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-medium">+</button>
              </div>
              <p className="text-lg font-bold text-gray-900 min-w-[5rem] text-right">{formatPrice(item.price * item.quantity)}</p>
              <button onClick={() => removeFromCart(item._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-medium">{cartTotal >= 200 ? <span className="text-green-600">Free</span> : formatPrice(25)}</span></div>
            {cartTotal < 200 && <p className="text-xs text-gray-400">Add GH₵ {formatPrice(200 - cartTotal)} more for free delivery</p>}
            <hr />
            <div className="flex justify-between text-lg"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-gray-900">{formatPrice(cartTotal + (cartTotal >= 200 ? 0 : 25))}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            Proceed to Checkout
          </Link>
          <Link to="/products" className="btn-secondary w-full mt-3 flex items-center justify-center gap-2">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
