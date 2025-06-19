const express = require('express');
const router = express.Router();
const paystack = require('../utils/paystack');
const { v4: uuidv4 } = require('uuid');
const {findUserByEmail} = require("../modules/auth/register/register.service");
const {User, UserModel} = require('../modules/auth/register/register.model');
const VerificationRequest = require('../models/VerificationRequest');

// Check subscription status
router.get('/subscription/status', async (req, res) => {
  const { email } = req.query; 

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isActive = user.subscriptionStatus === 'active' && 
      user.subscriptionStart && 
      new Date(user.subscriptionStart).getTime() + 365 * 24 * 60 * 60 * 1000 > Date.now();

    res.json({
      subscriptionStatus: isActive ? 'active' : 'inactive',
      subscriptionStart: user.subscriptionStart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Subscription payment (unchanged)
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  const planCode = 'PLN_gpfv69yl862nq1y';

  const reference = `sub_${uuidv4()}`;

  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: 10000 * 100,
      plan: planCode,
      reference: reference,
    });

    res.json({
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});


// router.get('/unsubscribe', async (req, res) => {
//   const { email } = req.params;

//   try {
//     const user = await findUserByEmail(email);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     user.subscriptionStatus = 'inactive';
//     user.subscriptionStart = null;
//     user.subscriptionReference = null;
//     await user.save();
//     res.json({ message: 'Subscription canceled' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to cancel subscription' });
//   }
// });


// user payments by userId
router.get('/user/payments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // 1. Get user and subscription details
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Get all verification requests for this user
    const verificationRequests = await VerificationRequest.find({ userId }).lean();

    // 3. Prepare subscription details
    const subscription = {
      status: user.subscriptionStatus,
      start: user.subscriptionStart,
      reference: user.subscriptionReference,
    };

    res.json({
      subscription,
      verificationRequests,
    });
  } catch (error) {
    console.error('Failed to fetch user payments:', error);
    res.status(500).json({ error: 'Failed to fetch user payments' });
  }
});


// new function to get all transactions from paystack
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await paystack.transaction.list();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});


router.post('/transactions/:id/reinitiate', async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by ObjectId first, fallback to paymentReference if invalid
    let payment = null;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      payment = await VerificationRequest.findById(id);
    }
    if (!payment) {
      payment = await VerificationRequest.findOne({ paymentReference: id });
    }
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Generate a new reference
    const newReference = `ver_${uuidv4()}`;

    // Re-initiate payment with Paystack
    const response = await paystack.transaction.initialize({
      email: payment.userEmail,
      amount: 1000 * 100,
      reference: newReference,
      metadata: {
        verification_data: {
          firstName: payment.firstName,
          lastName: payment.lastName,
          nin: payment.nin,
          email: payment.email,
          phoneNumber: payment.phoneNumber
        }
      }
    });

    // Update the payment record with new reference and status
    payment.paymentReference = newReference;
    payment.status = 'pending';
    payment.paymentVerified = false;
    payment.verifiedAt = null;
    await payment.save();

    res.json({
      ...payment.toObject(),
      authorization_url: response.data.authorization_url,
      reference: newReference,
      access_code: response.data.access_code
    });
  } catch (error) {
    console.error('Error reinitiating payment:', error);
    res.status(500).json({ error: 'Failed to reinitiate payment', details: error.message });
  }
});

router.post('/verify', async (req, res) => {
  const { userEmail, firstName, lastName, nin, email, phoneNumber, tenantId, userId } = req.body;
  
  // Validate required fields
  if (!userEmail || !firstName || !lastName || !nin || !email || !phoneNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const reference = `ver_${uuidv4()}`;

  try {
    // Create a new verification request
    const verificationRequest = new VerificationRequest({
      userEmail,
      firstName,
      lastName,
      nin,
      tenantId,
      email,
      phoneNumber,
      userId,
      paymentReference: reference,
      status: 'pending'
    });
    await verificationRequest.save();

    // Initialize Paystack payment
    const response = await paystack.transaction.initialize({
      email: userEmail, 
      amount: 1000 * 100, 
      reference,
      metadata: {
        verification_data: {
          firstName,
          lastName,
          nin,
          email,
          phoneNumber
        }
      }
    });

    res.json({
      authorization_url: response.data.authorization_url,
      reference,
      access_code: response.data.access_code
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ 
      error: 'Payment initialization failed',
      details: error.message 
    });
  }
});

router.post('/search-tenant', async (req, res) => {
  const { searchTerm, userId, email, amount } = req.body;

  if (!userId || !email || !amount) {
    return res.status(400).json({ error: 'userId, email, and amount are required' });
  }

  const reference = `tenant_${uuidv4()}`; 

  try {
    // Initialize Paystack payment
    const response = await paystack.transaction.initialize({
      email,
      amount,
      reference,
      metadata: {
        userId,
        searchTerm,
        purpose: 'Tenant Search Payment',
      },
    });

    res.json({
      authorization_url: response.data.authorization_url,
      reference,
      access_code: response.data.access_code,
    });
  } catch (error) {
    console.error('Error initializing tenant search payment:', error);
    res.status(500).json({
      error: 'Payment initialization failed',
      details: error.message,
    });
  }
});


router.get('/verify/:reference', async (req, res) => {
  try {
    // 1. Get and validate reference
    const reference = req.params.reference;

    if (!reference || !reference.startsWith('ver_')) {
      return res.status(400).json({ 
        status: 'invalid',
        message: 'Valid verification reference is required'
      });
    }

    const paystackResponse = await paystack.transaction.verify(reference);
    const paymentData = paystackResponse.data;

    if (paymentData.status !== 'success') {
      return res.status(402).json({ 
        status: 'payment_failed',
        message: 'Payment not successful',
        paystackStatus: paymentData.status
      });
    }

    const updateResult = await VerificationRequest.updateOne(
      { paymentReference: reference },
      { 
        $set: {
          status: 'paid',
          paymentVerified: true,
          verifiedAt: new Date(),
          paymentData: paymentData
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        status: 'not_found',
        message: 'Verification request not found'
      });
    }

    const updatedRequest = await VerificationRequest.findOne(
      { paymentReference: reference },
      { 
        status: 1,
        paymentVerified: 1,
        verifiedAt: 1,
        userEmail: 1,
        _id: 0
      }
    ).lean();

    res.json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        ...updatedRequest,
        reference: reference 
      }
    });

  } catch (error) {

    if (error.response?.data?.message?.includes('Transaction not found')) {
      return res.status(404).json({
        status: 'not_found',
        message: 'Transaction not found in Paystack'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/verification/requests/delete', async (req, res) => {
  try {
    await VerificationRequest.deleteMany({});
    res.json({ message: 'All verification requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete verification requests' });
  }
})

router.get('/verification/requests/all', async (req, res) => {
  try {
    const verificationRequests = await VerificationRequest.find();
    res.json(verificationRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
})

router.get('/verification/requests', async (req, res) => {
  const { userId } = req.query; 

  try {
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const verificationRequests = await VerificationRequest.find({ userId });
    res.json(verificationRequests);
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// Webhook (updated to handle verification)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = require('crypto')
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { amount, reference } = event.data;
      const email = event.data.customer.email;
      if (reference.startsWith('sub_')) {
        console.log('Updating subscription for user:', { email, reference });
        const updateResult = await UserModel.updateOne(
          { email },
          {
            subscriptionStatus: 'active',
            subscriptionStart: new Date(),
            subscriptionReference: reference,
          }
        );
      
      } else if (reference.startsWith('ver_')) {
        await VerificationRequest.updateOne(
          { paymentReference: reference },
          {
            status: 'paid',
            paymentVerified: true,
            verifiedAt: new Date()
          }
        );
      }
    }
  }
  res.sendStatus(200);
});

module.exports = router;