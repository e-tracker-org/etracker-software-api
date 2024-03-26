
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
        is_active: Boolean,
        status: String,
        apartmentType: String,
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
