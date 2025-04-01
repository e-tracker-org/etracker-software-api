const User = require('../modules/auth/register/register.model');
// import {User} from "../modules/auth/register/register.model";

const checkSubscription = async (req, res, next) => {
  const { email } = req.user; // Assume email is set by auth middleware (e.g., JWT)

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isActive = user.subscriptionStatus === 'active' && 
      user.subscriptionStart && 
      new Date(user.subscriptionStart).getTime() + 365 * 24 * 60 * 60 * 1000 > Date.now();

    if (!isActive) {
      return res.status(403).json({ error: 'Active subscription required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkSubscription;