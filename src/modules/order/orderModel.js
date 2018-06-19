
module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let orderSchema = new Schema({
    orderId: {type: Number, description: 'Order Id in Blockchain'},
    player: {type: String, description: 'Player address in Blockchain'},
    gameId: {type: Number, description: 'Game id in Blockchain'},
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    orderType: {type: Number, description: 'Buy=0, Sell=1'},
    amount: {type: Number, description: 'Amount of order'},
    odd: {type: Number, description: 'Odd of order'},
    outcome: {type: Number, description: 'Draw=0, One=1, Two=2'},
    status: {type: Number, description: 'Open=0, Matched=1, Win=2, Lose=3, Closed=4'},
    matchedOrderId: {type: Number, description: 'Matched order id in Blockchain'},

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
