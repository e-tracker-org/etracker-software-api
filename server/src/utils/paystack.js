const Paystack = require('paystack-api');

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

module.exports = paystack;