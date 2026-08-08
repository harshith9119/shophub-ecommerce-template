import crypto from 'crypto';
import { createServiceClient } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(503).json({ error: 'Razorpay not configured' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      firestoreOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const dbOrderId = orderId || firestoreOrderId;
    const supabase = createServiceClient();
    if (dbOrderId && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbOrderId);
      if (error) console.error('Order update error:', error);
    }

    return res.status(200).json({ success: true, verified: true });
  } catch (err) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
