
module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: String,
        description: String,
        price: Number,
        year_built: Number,
        number_of_bedrooms: Number,
        number_of_bath: Number,
        location: Object,
        address: String,
        is_active: { type: Boolean, default: true },
        status: String,
        apartmentType: String, // Keeping for backward compatibility
        propertyType: String,  // New field for expanded property types
        agreement_estimate: Number,
        land_size: Object, // { value: Number, unit: String }
        image_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'files' }],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users' 
        },
        current_owner: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'users'
        },
        tenant: Array,

      },
      { timestamps: true }
    );
    
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Properties = mongoose.model("properties", schema);
    return Properties;
  };
