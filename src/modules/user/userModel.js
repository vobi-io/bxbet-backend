/* eslint no-useless-escape:0 */
/* eslint handle-callback-err:0 */

const Promise = require('bluebird')
const MyError = require('../../utils/responses/errors')
const debug = require('debug')('vobi')
const baseModelPlugin = require('../core/baseModelPlugin')
const listRoles = require('../../modules/roles/roles').listRoles

const categoryList = []
const genres = []

module.exports = (mongoose) => {
  const Schema = mongoose.Schema

  const userSchema = new Schema({
    creationDate: { type: Date },
    modified: { type: Date },
    modifierUser: { type: Schema.Types.ObjectId, ref: 'user' },
    firstName: { type: String },
    lastName: { type: String },
    description: { type: String }, // profile description
    location: { type: String },
    birthDate: { type: Date },
    phone: { type: String },
    gender: { type: String },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String }
    },
    isSuperAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    category: [{ type: String, enum: categoryList }],
    genres: [{ type: String, enum: genres }],
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      required: true,
      match: [
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        'Please fill a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: true
    },
    account: {
      active: {
        type: Boolean,
        default: true
      },
      resetPasswordToken: String,
      resetPasswordExpires: Date,
      activationToken: String,
      activationExpires: Date
    },
    role: { type: String, default: 'User', enum: listRoles },
    status: { type: String, default: 'confirmed' },
    avatar: { type: String },
    confirmed: { type: Boolean, default: false },
    blockChain: {
    }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    setDefaultsOnInsert: true
  })

  userSchema.pre('save', (next) => {
    this.modified = Date.now()
    next()
  })

  userSchema.plugin(baseModelPlugin)

  userSchema.virtual('id').get(function () {
    return this._id
  })

  // // userSchema.virtual('fullName').get(function() {
  // //   return ((this.firstName || '') + ' ' + (this.lastName || '')).trim()
  // })

  // checking if password is valid
  userSchema.methods.validatePassword = function (password) {
    const bcrypt = require('bcrypt-nodejs')
    return bcrypt.compareSync(password, this.password)
  }

  userSchema.statics.findOneByAnyEmailOrUsername = function (email) {
    // Now by default we are setting user as active
    return this
      .findOne()
      .where('email').equals(email)
      .where('account.active').equals(true)
  }
  userSchema.statics.getByEmail = function (email) {
    // Now by default we are setting user as active
    return this
      .findOne()
      .where('email').equals(email)
  }
  // checking if password is valid
  // userSchema.statics.validatePassword = function(password) {
  //   const bcrypt = require('bcrypt-nodejs')
  //   return bcrypt.compareSync(password, this.password)
  // }

  userSchema.statics.generateInfo = function (user) {
    let userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone !== undefined ? user.phone : '',
      // company: (user.company !== undefined && user.company.name) ? user.company.name : '',
      jobPosition: user.jobPosition !== undefined ? user.jobPosition : ''
    }
    let userInfo = JSON.stringify(userData)
    return userInfo
  }

  userSchema.statics.findUserByToken = function (token) {
    return this.findOne()
      .where('account.activationToken').equals(token)
      // REVIEW REOMVED CHECKING WITH EXPIRED DATE -> AFTER TALIKING TO CLIENT
      // .where('account.activationExpires').gte(Date.now())
      .then((user) => {
        if (!user) return Promise.reject()

        return Promise.resolve(user)
      }).catch((err) => {
        return Promise.reject(
          MyError.badRequest('User not found or token expired or already active!')
        )
      })
  }

  userSchema.statics.findUserByPasswordToken = function (token) {
    debug('findUserByPasswordToken', token)

    return this
      .findOne()
      .where('account.resetPasswordToken').equals(token)
      .where('account.resetPasswordExpires').gte(Date.now())
  }

  // check if user email already exists in company
  userSchema.statics.checkIfEmailExist = function (email, id) {
    return this
      .findOne({
        email,
        _id: { $ne: id }
      })
      .exec()
      .then(user => {
        if (!user || !user._id) {
          return Promise.resolve(
            MyError.notFound('User not found')
          )
        }
        // return Promise.reject(MyError.badRequest('User exists with this email'))
        return Promise.reject(
          MyError.badRequest('User already joined!')
        )
      })
  }

  userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    if (obj.account) {
      // set active at root
      obj.active = obj.account.active
    }
    // remove props that should not be exposed
    delete obj.password
    delete obj.__v
    // delete obj._id
    delete obj.account

    return obj
  }

  userSchema.methods.toJSONWithoutId = function () {
    const obj = this.toObject()
    // set active at root
    if (obj.account) {
      // set active at root
      obj.active = obj.account.active
    }
    // remove props that should not be exposed
    delete obj.password
    delete obj.__v
    // delete obj._id
    delete obj.account
    delete obj._id
    // delete obj.id

    delete obj.blockChain.address
    delete obj.blockChain.address

    return obj
  }

  return mongoose.model('User', userSchema)
}

/**
 * @apiDefine UserModel
 *
 * @apiParam {String} [email] email of user.
 * @apiParam {String} [firstName] FirstName of user.
 * @apiParam {String} [lastName] LastName of user.
 * @apiParam {String} [description] description.
 * @apiParam {String} [location] location.
 * @apiParam {String} [birthDate] birthDate.
 * @apiParam {String} [phone] phone.
 * @apiParam {String} [gender] gender.
 * @apiParam {Object} [bookingInfo]  bookingInfo Object.
 * @apiParam {Object} [socialLinks]  socialLinks Object.
 * @apiParam {String[]} [category]  category list.
 * @apiParam {String[]} [genres]  genres list.
 *
 */

/**
 * @apiDefine UserModelSuccess
 *
 * @apiSuccess {String} [email] email of user..
 * @apiSuccess {String} [firstName] FirstName of user
 * @apiSuccess {String} [lastName] LastName of user.
 * @apiSuccess {String} [description] description.
 * @apiSuccess {String} [location] location.
 * @apiSuccess {String} [birthDate] birthDate.
 * @apiSuccess {String} [phone] phone.
 * @apiSuccess {String} [gender] gender.
 * @apiSuccess {Object} [bookingInfo]  bookingInfo Object.
 * @apiSuccess {Object} [socialLinks]  socialLinks Object.
 * @apiSuccess {Object} [socialLinks]  socialLinks Object.
 * @apiSuccess {String[]} [category]  category list.
 * @apiSuccess {String[]} [genres]  genres list.
 *
 */
