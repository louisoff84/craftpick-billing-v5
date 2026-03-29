const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// PayPal configuration (sandbox for development)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'YOUR_SANDBOX_CLIENT_ID';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_SANDBOX_CLIENT_SECRET';
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('PayPal auth error:', error);
    throw new Error('Failed to authenticate with PayPal');
  }
}

// Create PayPal payment
router.post('/create', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['EUR', 'USD']).withMessage('Invalid currency'),
  body('description').notEmpty().withMessage('Description is required'),
  body('returnUrl').isURL().withMessage('Valid return URL is required'),
  body('cancelUrl').isURL().withMessage('Valid cancel URL is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { amount, currency, description, returnUrl, cancelUrl } = req.body;
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Create payment payload
    const paymentData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `PU-${Date.now()}`,
        description: description,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        custom_id: `user-${req.user?.id || 'guest'}-${Date.now()}`
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'CraftPick Hosting',
        locale: 'fr-FR',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };
    
    // Create PayPal order
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const order = await response.json();
    
    if (response.ok) {
      // Find approval URL
      const approvalLink = order.links.find(link => link.rel === 'approve');
      
      res.json({
        success: true,
        data: {
          orderId: order.id,
          approvalUrl: approvalLink.href,
          amount: amount,
          currency: currency,
          description: description
        }
      });
    } else {
      throw new Error(order.message || 'Failed to create PayPal order');
    }
  } catch (error) {
    console.error('PayPal payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// Capture PayPal payment
router.post('/capture', [
  body('orderId').notEmpty().withMessage('Order ID is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the payment
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const captureData = await response.json();
    
    if (response.ok) {
      // Payment successful
      const payment = captureData.purchase_units[0].payments.captures[0];
      
      // Save payment to database (in production)
      await savePayment({
        paypalOrderId: orderId,
        paypalPaymentId: payment.id,
        amount: parseFloat(payment.amount.value),
        currency: payment.amount.currency_code,
        status: payment.status,
        createTime: payment.create_time,
        updateTime: payment.update_time,
        userId: req.user?.id || null,
        description: captureData.purchase_units[0].description
      });
      
      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount,
          createTime: payment.create_time
        }
      });
    } else {
      throw new Error(captureData.message || 'Failed to capture payment');
    }
  } catch (error) {
    console.error('PayPal payment capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture payment',
      error: error.message
    });
  }
});

// Get payment details
router.get('/details/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Get order details
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const order = await response.json();
    
    if (response.ok) {
      res.json({
        success: true,
        data: order
      });
    } else {
      throw new Error(order.message || 'Failed to get order details');
    }
  } catch (error) {
    console.error('PayPal order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
});

// Alternative payment methods (Stripe, etc.)
router.post('/alternative', [
  body('method').isIn(['stripe', 'bank_transfer', 'crypto']).withMessage('Invalid payment method'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['EUR', 'USD']).withMessage('Invalid currency'),
  body('description').notEmpty().withMessage('Description is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { method, amount, currency, description } = req.body;
    
    let paymentResult;
    
    switch (method) {
      case 'stripe':
        paymentResult = await processStripePayment(req);
        break;
      case 'bank_transfer':
        paymentResult = await processBankTransfer(req);
        break;
      case 'crypto':
        paymentResult = await processCryptoPayment(req);
        break;
      default:
        throw new Error('Unsupported payment method');
    }
    
    res.json({
      success: true,
      data: paymentResult
    });
  } catch (error) {
    console.error('Alternative payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Process Stripe payment (placeholder)
async function processStripePayment(req) {
  // In production, integrate with actual Stripe API
  const { amount, currency, description } = req.body;
  
  return {
    method: 'stripe',
    paymentId: `pi_${Date.now()}`,
    amount: amount,
    currency: currency,
    status: 'pending',
    clientSecret: `pi_${Date.now()}_secret_${Date.now()}`,
    message: 'Stripe payment initiated'
  };
}

// Process bank transfer (placeholder)
async function processBankTransfer(req) {
  const { amount, currency, description } = req.body;
  
  return {
    method: 'bank_transfer',
    referenceId: `BT_${Date.now()}`,
    amount: amount,
    currency: currency,
    status: 'pending',
    bankDetails: {
      accountName: 'CraftPick Hosting',
      accountNumber: 'FR76 3000 6000 0000 0000 0000 000',
      iban: 'FR7630006000000000000000000',
      bic: 'BNPAFRPP',
      reference: `CP-${Date.now()}`
    },
    message: 'Bank transfer instructions generated'
  };
}

// Process crypto payment (placeholder)
async function processCryptoPayment(req) {
  const { amount, currency, description } = req.body;
  
  return {
    method: 'crypto',
    paymentId: `crypto_${Date.now()}`,
    amount: amount,
    currency: currency,
    status: 'pending',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    supportedCurrencies: ['BTC', 'ETH', 'USDT'],
    message: 'Crypto payment address generated'
  };
}

// Save payment to database (placeholder)
async function savePayment(paymentData) {
  // In production, save to actual database
  console.log('Payment saved:', paymentData);
  
  // Send confirmation email
  await sendPaymentConfirmation(paymentData);
}

// Send payment confirmation email (placeholder)
async function sendPaymentConfirmation(paymentData) {
  // In production, integrate with email service
  console.log('Payment confirmation sent for:', paymentData.paypalPaymentId);
}

// Webhook for PayPal notifications
router.post('/webhook', async (req, res) => {
  try {
    const webhookId = req.headers['paypal-webhook-id'];
    const webhookSignature = req.headers['paypal-webhook-signature'];
    
    // Verify webhook signature (in production)
    const isValid = await verifyWebhookSignature(req.body, webhookSignature);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }
    
    // Process webhook event
    const eventType = req.body.event_type;
    const resource = req.body.resource;
    
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(resource);
        break;
      default:
        console.log('Unhandled webhook event:', eventType);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Verify webhook signature (placeholder)
async function verifyWebhookSignature(payload, signature) {
  // In production, implement actual webhook verification
  return true;
}

// Handle payment completion
async function handlePaymentCompleted(resource) {
  console.log('Payment completed:', resource);
  // Update database, send notifications, etc.
}

// Handle payment denial
async function handlePaymentDenied(resource) {
  console.log('Payment denied:', resource);
  // Update database, send notifications, etc.
}

// Get payment history for user
router.get('/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get user payments from database (placeholder)
    const payments = await getUserPayments(userId);
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// Get user payments from database (placeholder)
async function getUserPayments(userId) {
  // In production, query actual database
  return [
    {
      id: 'pay_1',
      amount: 29.99,
      currency: 'EUR',
      description: 'Professional Hosting - Monthly',
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      method: 'paypal'
    },
    {
      id: 'pay_2',
      amount: 49.99,
      currency: 'EUR',
      description: 'SSL Certificate - Annual',
      status: 'completed',
      date: '2024-01-10T14:20:00Z',
      method: 'stripe'
    }
  ];
}

module.exports = router;
