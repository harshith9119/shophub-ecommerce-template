const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  keyId,
  amount,
  orderNumber,
  razorpayOrderId,
  customer,
  onSuccess,
  onFailure,
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Could not load Razorpay. Check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: Math.round(amount),
      currency: 'INR',
      name: 'ShopHub',
      description: `Order ${orderNumber}`,
      order_id: razorpayOrderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#064e3b' },
      handler: (response) => {
        onSuccess(response);
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          onFailure?.({ reason: 'dismissed' });
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onFailure?.(response.error);
      reject(new Error(response.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}


