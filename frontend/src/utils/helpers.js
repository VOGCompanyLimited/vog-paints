export const formatPrice = (price) => {
  return `GH₵ ${Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const colorFamilies = [
  { name: 'Reds', hex: '#DC2626' },
  { name: 'Blues', hex: '#2563EB' },
  { name: 'Greens', hex: '#16A34A' },
  { name: 'Yellows', hex: '#EAB308' },
  { name: 'Purples', hex: '#9333EA' },
  { name: 'Pinks', hex: '#EC4899' },
  { name: 'Oranges', hex: '#EA580C' },
  { name: 'Neutrals', hex: '#6B7280' },
  { name: 'Whites', hex: '#F8FAFC' },
  { name: 'Blacks', hex: '#111827' }
];

export const finishes = ['Matte', 'Gloss', 'Satin', 'Eggshell', 'Semi-Gloss'];

export const categories = [
  'Interior Paint', 'Exterior Paint', 'Wood Paint', 'Metal Paint',
  'Wall Paint', 'Ceiling Paint', 'Floor Paint', 'Primer',
  'Spray Paint', 'Specialty Paint'
];
