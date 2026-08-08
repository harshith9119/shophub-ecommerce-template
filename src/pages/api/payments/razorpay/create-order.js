import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId || !keySecret || !publicKey) {
    return res.status(503).json({
      error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local',
    });
  }

  try {
    const { amount, orderNumber, customerName, customerEmail, customerPhone } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: orderNumber || `receipt_${Date.now()}`,
      notes: {
        customer_name: customerName || '',
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
      },
    });

    return res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      keyId: publicKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    return res.status(500).json({ error: 'Failed to create payment order. Check your Razorpay keys.' });
  }
}
