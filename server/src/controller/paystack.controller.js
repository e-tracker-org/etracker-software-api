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


router.post('/verify', async (req, res) => {
  const { userEmail, firstName, lastName, nin, email, phoneNumber, tenantId } = req.body;
  
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

router.get('/verification/requests', async (req, res) => {
  try {
    const verificationRequests = await VerificationRequest.find();
    res.json(verificationRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
})

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
      const { email, amount, reference } = event.data;

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
      
        console.log('Update result:', updateResult);
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