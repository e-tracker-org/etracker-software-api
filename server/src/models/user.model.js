module.exports = (mongoose) => {
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
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model('users', schema);
  return User;
};
