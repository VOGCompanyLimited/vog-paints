import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiMapPin } from 'react-icons/fi';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '', city: '', region: '',
    coordinates: { lat: 5.6037, lng: -0.1870 }
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (cartItems.length === 0) { navigate('/cart'); return; }
    if (user.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setAddress({ street: def.street || '', city: def.city || '', region: def.region || '', coordinates: def.coordinates || { lat: 5.6037, lng: -0.1870 } });
    }
  }, [user, cartItems]);

  const loadMap = () => {
    if (window.google && !mapLoaded) {
      setMapLoaded(true);
      const geocoder = new window.google.maps.Geocoder();
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: address.coordinates, zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
      });
      let marker = new window.google.maps.Marker({ position: address.coordinates, map, draggable: true });

      window.google.maps.event.addListener(marker, 'dragend', function() {
        const pos = this.getPosition();
        setAddress(prev => ({ ...prev, coordinates: { lat: pos.lat(), lng: pos.lng() } }));
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const comps = results[0].address_components;
            let street = '', city = '', region = '';
            comps.forEach(c => {
              if (c.types.includes('route')) street = c.long_name;
              if (c.types.includes('locality')) city = c.long_name;
              if (c.types.includes('administrative_area_level_1')) region = c.long_name;
            });
            setAddress(prev => ({ ...prev, street, city, region }));
          }
        });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city) return toast.error('Please enter your delivery address');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress: address,
        paymentMethod,
        notes
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const delivery = cartTotal >= 200 ? 0 : 25;
  const total = cartTotal + delivery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-600" /> Delivery Address
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street / Location</label>
                <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="input-field" placeholder="e.g. 123 Independence Ave" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="input-field" placeholder="e.g. Accra" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input type="text" value={address.region} onChange={(e) => setAddress({...address, region: e.target.value})} className="input-field" placeholder="e.g. Greater Accra" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pin your location on map <span className="text-gray-400 font-normal">(drag the marker to adjust)</span></p>
              <div id="map" className="map-container bg-gray-100" onClick={loadMap}>
                {!mapLoaded && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Click to load map & pin your location
                    <button type="button" onClick={loadMap} className="ml-2 text-primary-600 font-medium">Load Map</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">Pay on Delivery</p>
                  <p className="text-sm text-gray-500">Pay with cash or mobile money when your order arrives</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">Bank Transfer / Mobile Money</p>
                  <p className="text-sm text-gray-500">Pay via bank transfer, Momo, or ATM</p>
                </div>
              </label>
            </div>
            {paymentMethod === 'bank_transfer' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-2">Bank Details</p>
                <p className="text-sm text-gray-600">Bank: Access Bank Ghana</p>
                <p className="text-sm text-gray-600">Account: 1001234567</p>
                <p className="text-sm text-gray-600">Name: VOG Company Limited</p>
                <p className="text-xs text-gray-400 mt-2">Use your order number as reference. We will confirm payment within 24 hours.</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field h-24 resize-none" placeholder="Any special instructions for delivery?" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                  {item.images?.[0] ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><div className="w-4 h-4 rounded-full" style={{backgroundColor: item.colorHex}} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <hr />
          <div className="space-y-2 text-sm mt-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span></div>
            <hr />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
