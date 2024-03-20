const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
