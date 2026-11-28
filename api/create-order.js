// ==================== VERCEL SERVERLESS: CREATE RAZORPAY UPI/CARD ORDER ====================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, deviceId } = req.body || {};
    const plans = {
      pro_personal: { amount: 9900, label: 'One Chat Pro Host (Lifetime)' },   // ₹99.00
      pro_cafe:     { amount: 49900, label: 'One Chat Cafe / Lounge Venue Pass' } // ₹499.00
    };

    const selected = plans[planId] || plans.pro_personal;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Razorpay environment keys not configured on Vercel.' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: selected.amount,
        currency: 'INR',
        receipt: `oc_${Date.now()}`,
        notes: {
          planId: planId || 'pro_personal',
          deviceId: String(deviceId || 'unknown').slice(0, 64)
        }
      })
    });

    const order = await rzpRes.json();
    if (!rzpRes.ok) {
      return res.status(rzpRes.status).json({ error: order.error?.description || 'Failed to create order' });
    }

    return res.status(200).json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      description: selected.label
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
