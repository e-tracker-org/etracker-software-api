module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      action: String,
      userId: String,
      tenantEmail: String,
      propertyId: [String],
      landlordId: [String],
      //   status: String,
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const History = mongoose.model('history', schema);
  return History;
};
