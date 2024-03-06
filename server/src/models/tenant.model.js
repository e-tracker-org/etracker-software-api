
module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        userId: String,
        propertyId: String,
        landlordId: String,
        status: String,
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Tenant = mongoose.model("tenants", schema);
    return Tenant;
  };
