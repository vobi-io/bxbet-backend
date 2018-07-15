module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let gameSchema = new Schema({
    gameId: {type: Number, description: 'Game id in Blockchain', index: true},
    homeTeam: {type: String, index: true},
    awayTeam: {type: String, index: true},
    category: {type: String, description: 'Football, Basketball, etc...'},
    startDate: {type: Number, description: 'Game start date'},
    endDate: {type: Number, description: 'Game end date', index: true},
    status: {type: Number, description: 'FinishedDraw=0, FinishedOne=1, FinishedTwo=2, Open=3'},
    owner: {type: String},
    totalOrders: {type: Number, default: 0, description: 'Total orders'},
    created: {type: Date, default: Date.now},
    modified: {type: Date}
  }, {})

  gameSchema.pre('save', (next) => {
    this.modified = Date.now()
    this.type = 'news'
    next()
  })

  gameSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }
  // gameSchema.plugin(baseModelPlugin)

  return mongoose.model('Game', gameSchema)
}

/**
 * @apiDefine EventModel
 *
 * @apiParam {String} [title] game title.
 * @apiParam {String} [text] game description.
 * @apiParam {String} [type] game type.
 * @apiParam {String} [category] game category.
 * @apiParam {Object} [urls] game urls (type, url, mainCover).
 * @apiParam {String} [date] game date.
 * @apiParam {Object} [user] game user.
 *
 */

/**
 * @apiDefine EventModelSuccess
 *
 * @apiSuccess {String} id Unique id.
 * @apiSuccess {String} title game title.
 * @apiSuccess {String} type game type.
 * @apiSuccess {String} category game category.
 * @apiSuccess {String} urls game urls (type, url, mainCover).
 * @apiSuccess {String} date game date.
 *
 */
