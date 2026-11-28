// ==================== VERCEL SERVERLESS: VERIFY RAZORPAY SIGNATURE & ISSUE PRO KEY ====================
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      deviceId,
      planId
    } = req.body || {};

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const signSecret = process.env.LICENSE_SIGNING_SECRET || keySecret;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // 1. Cryptographically verify payment came from Razorpay
    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // 2. Generate deterministic Pro License Key bound to device + payment
    const cleanDevice = String(deviceId || 'ONECHAT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const digest = crypto
      .createHmac('sha256', signSecret)
      .update(`${cleanDevice}:${razorpay_payment_id}:${planId || 'pro_personal'}`)
      .digest('hex')
      .toUpperCase();

    const licenseKey = `OCPRO-${digest.slice(0, 4)}-${digest.slice(4, 8)}-${digest.slice(8, 12)}`;

    return res.status(200).json({
      verified: true,
      licenseKey,
      paymentId: razorpay_payment_id,
      planId: planId || 'pro_personal'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
}
