
module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        propertyAddress: String,
        landlordID: String,
        complaints: String,
        tenantEmail: String,
        tenantPhone: String,
        tenantName: String,
        status: String,
        tenantGender: String,
        proof: String,
        tenantNIN: String,
        landlordNIN: String
        
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const TenantDefault = mongoose.model("tenantDefault", schema);
    return TenantDefault;
  };
