const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nin: { type: String, required: true }, 
  email: { type: String, required: true }, 
  phoneNumber: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'completed', 'failed'] },
  paymentReference: { type: String, unique: true },
  paymentVerified: { type: Boolean, default: false },
  result: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);