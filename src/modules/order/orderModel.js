
module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let orderSchema = new Schema({
    orderId: {type: Number},
    player: {type: String},
    gameId: {type: Number},
    orderType: {type: Number},
    amount: {type: Number},
    odd: {type: Number},
    outcome: {type: Number},
    status: {type: Number},
    matchedOrderId: {type: Number},

    created: {type: Date, default: Date.now},
    modified: {type: Date}
  }, {})

  orderSchema.pre('save', (next) => {
    this.modified = Date.now()
    this.type = 'news'
    next()
  })

  orderSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }
  // orderSchema.plugin(baseModelPlugin)

  return mongoose.model('Order', orderSchema)
}
