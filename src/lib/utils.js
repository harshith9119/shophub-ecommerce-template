export const formatPrice = (amount) => {
  if (amount == null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

export const calcDiscount = (sale, regular) => {
  if (!regular || regular <= sale) return 0;
  return Math.round(regular - sale);
};

export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    description: 'Pay when your order arrives at your doorstep',
    requiresOnline: false,
  },
  {
    id: 'razorpay',
    label: 'Pay Online — UPI / Card / Net Banking',
    description: 'Secure payment powered by Razorpay',
    requiresOnline: true,
  },
];
