const typeList = ['Football', 'News']
const categoryList = ['Football', 'Basketball', 'Tenis']

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let eventSchema = new Schema({
    title: {type: String},
    text: {type: String},
    type: {type: String, enum: typeList},
    category: {type: String, enum: categoryList},
    urls: [{
      type: {type: String, enum: ['video', 'photo']},
      url: {type: String},
      mainCover: {type: Boolean, default: false}
    }],
    date: {type: Date, description: 'Event date'},
    user: {type: Schema.Types.ObjectId, ref: 'User', description: 'Event creator', index: true},
    modifierUser: {type: Schema.Types.ObjectId, ref: 'User'},
    status: { type: String, default: 'active', required: true, index: 1 },
    created: {type: Date, default: Date.now},
    modified: {type: Date}
  }, {})

  eventSchema.pre('save', (next) => {
    this.modified = Date.now()
    this.type = 'news'
    next()
  })

  eventSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }
  // eventSchema.plugin(baseModelPlugin)

  return mongoose.model('Event', eventSchema)
}

/**
 * @apiDefine EventModel
 *
 * @apiParam {String} [title] event title.
 * @apiParam {String} [text] event description.
 * @apiParam {String} [type] event type.
 * @apiParam {String} [category] event category.
 * @apiParam {Object} [urls] event urls (type, url, mainCover).
 * @apiParam {String} [date] event date.
 * @apiParam {Object} [user] event user.
 *
 */

/**
 * @apiDefine EventModelSuccess
 *
 * @apiSuccess {String} id Unique id.
 * @apiSuccess {String} title event title.
 * @apiSuccess {String} type event type.
 * @apiSuccess {String} category event category.
 * @apiSuccess {String} urls event urls (type, url, mainCover).
 * @apiSuccess {String} date event date.
 *
 */
