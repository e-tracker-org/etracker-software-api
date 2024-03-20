const Rating = require('../models/rating');

exports.createRating = async (req, res) => {
  try {
    const { tenantId, landlordId, rating, comment } = req.body;

    let existingRating = await Rating.findOne({ tenantId });

    if (!existingRating) {
      existingRating = new Rating({
        tenantId,
        landlordId,
        rating: 0,
      });
    }

    // Update rating based on landlord's input
    if (rating === 'good') {
      existingRating.rating = Math.min(existingRating.rating + 10, 70);
    } else if (rating === 'bad') {
      existingRating.rating = Math.max(existingRating.rating - 10, 0);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid rating type' });
    }

    if (comment) {
      existingRating.comment = comment;
    }

    await existingRating.save();

    res.status(201).json({ success: true, message: 'Rating and comment added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Controller function to find the tenant rating
exports.getTenantRating = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const rating = await Rating.findOne({ tenantId });

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Tenant rating not found' });
    }

    res.status(200).json({ success: true, rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
