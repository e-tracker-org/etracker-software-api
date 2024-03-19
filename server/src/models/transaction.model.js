
module.exports = mongoose => {

    const Schema = mongoose.Schema;

    var schema = mongoose.Schema(
      {
        category: String,
        amount: String,
        dueDate: String,
        created_by: String,
        received_by: {
            type: Schema.Types.ObjectId, 
            ref: 'users' 
        },
        receiptFile: String,
        transactionId: String,
        status: String,
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Transaction = mongoose.model("transactions", schema);
    return Transaction;
  };

