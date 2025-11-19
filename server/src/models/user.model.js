module.exports = (mongoose) => {
  const argon2 = require('argon2');

  var schema = mongoose.Schema(
    {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      email: { type: String, required: true },
      state: { type: String, default: '' },
      isEmailVerified: { type: Boolean, default: false },
      password: { type: String, required: true },
      phone: { type: String, default: '' },
      gender: { type: String, default: '' },
      dob: { type: Date, default: new Date() },
      country: { type: String, default: '' },
      area: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      isUserVerified: { type: Boolean, default: false },
      accountTypes: { type: [Number], default: [] },
      currentKyc: { type: Object, default: null },
      profileImage: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      landmark: { type: String, default: '' },
      subscriptionStatus: { type: String, default: 'inactive' },
      subscriptionStart: { type: Date, default: null },
      subscriptionReference: { type: String, default: '' },
      verificationRequests: [
        {
        reference: { type: String, default: '' },
        status: { type: String, default: 'pending' },
        result: { type: String, default: '' },
      }]
    },
    { timestamps: true }
  );

  // Hash password before saving if it's new or modified
  schema.pre('save', async function (next) {
    try {
      if (this.isModified('password') || this.isNew) {
        if (this.password && !this.password.startsWith('$')) {
          this.password = await argon2.hash(this.password);
        }
      }
      return next();
    } catch (err) {
      return next(err);
    }
  });

  // Handle password hashing on findOneAndUpdate / findByIdAndUpdate
  schema.pre('findOneAndUpdate', async function (next) {
    try {
      const update = this.getUpdate();
      if (update && update.$set && update.$set.password) {
        const newPass = update.$set.password;
        if (newPass && !newPass.startsWith('$')) {
          update.$set.password = await argon2.hash(newPass);
          this.setUpdate(update);
        }
      } else if (update && update.password) {
        const newPass = update.password;
        if (newPass && !newPass.startsWith('$')) {
          update.password = await argon2.hash(newPass);
          this.setUpdate(update);
        }
      }
      return next();
    } catch (err) {
      return next(err);
    }
  });

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model('users', schema);
  return User;
};
