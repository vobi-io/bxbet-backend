/* eslint no-useless-constructor:0 */
/* eslint handle-callback-err:0 */
'use strict'
var randomstring = require('randomstring')
var multer = require('multer')
var crypto = require('crypto')
var mime = require('mime')
var path = require('path')
var fs = require('fs')
var gm = require('gm')

var AUTH_HEADER = 'authorization'
var DEFAULT_TOKEN_BODY_FIELD = 'access_token'
var DEFAULT_TOKEN_QUERY_PARAM_NAME = 'access_token'
var config = require('app/config')

class Utils {
  constructor () {
    // Nothing to do.
  }

  isObject (obj) {
    return typeof obj === 'object'
  }
  generateHash (password) {
    var bcrypt = require('bcrypt-nodejs')
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  }
  generateRandomHash () {
    var bcrypt = require('bcrypt-nodejs')
    var temphash = require('crypto').randomBytes(16).toString('hex')
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0') // replace '/' with '0';
    // TODO replace does not works
    // Replace characters according to base64url specifications
    var randomText = temphash.replace(/\+/g, '-')
    randomText = temphash.replace(/\//g, '_')
    randomText = temphash.replace(/=+$/, '')
    return bcrypt.hashSync(randomText, bcrypt.genSaltSync(5), null)
  }

  /**
   * Generate Random password
   * @param {any} length of generated string
   * @returns {String} generated random string
   *
   * @memberOf Utils
   */
  generateRandomPassword (length) {
    return randomstring.generate(length)
  }

  /**
   * Generates AlphNumeric random string for object_codes
   * @returns {String} generated string with alphanumeric characters
   * @memberOf Utils
   */
  generateCode () {
    return randomstring.generate({
      length: 6,
      charset: 'alphanumeric',
      capitalization: 'uppercase'
    })
  }

  /**
   * Generates Numeric random string for object_codes
   * @returns {String} generated string with numeric characters
   * @memberOf Utils
   */
  generateNumberCode () {
    return randomstring.generate({
      length: 6,
      charset: 'numeric'
    })
  }

  extractToken (req) {
    var token = null
    // Extract the jwt from the request
    // Try the header first
    if (req.headers[AUTH_HEADER]) token = req.headers[AUTH_HEADER]

    // If not in the header try the body
    if (!token && req.body) token = req.body[DEFAULT_TOKEN_BODY_FIELD]

    // if not in the body try query params
    if (!token) token = req.query[DEFAULT_TOKEN_QUERY_PARAM_NAME]

    return token
  }

  parseAuthHeader (hdrValue) {
    if (typeof hdrValue !== 'string') {
      return null
    }

    var re = /(\S+)\s+(\S+)/
    var matches = hdrValue.match(re)
    return matches && { scheme: matches[1], value: matches[2] }
  }
  /**
 * extracts file using multer
 * @param {Request} req request
 * @param {Response} res response
 * @param {string} what type of files should be upload ex: "images", "excel"
 * @returns {Promise<Express.Multer.File>} file
 */
  extractFiles (req, res, type, userId) {
    type = type || req.body.type

    const imageFormats = ['.jpg', '.png', '.jpeg']

    let ROOT_DIR = config.multer.uploadDir

    if (type === 'image') {
      ROOT_DIR = `${ROOT_DIR}images/${userId}`
    }

    let THUMBNAIL_DIR = `${ROOT_DIR}/thumbnails/`
    // if folder does not exists then create it
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR)
    }

    if (!fs.existsSync(THUMBNAIL_DIR)) {
      fs.mkdirSync(THUMBNAIL_DIR)
    }

    return new Promise((resolve, reject) => {
      var storage = multer.diskStorage({
        destination: function(req, file, cb) {
          cb(null, ROOT_DIR)
        },
        filename: function(req, file, cb) {
          crypto.pseudoRandomBytes(16, (err, raw) => {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype))
          })
        }

      })
      let upload = multer({
        storage: storage,
        fileFilter: function(req, file, cb) {
          switch (type) {
            case 'image':
              if (!imageFormats.includes(path.extname(file.originalname))) {
                return cb(new Error('Only formats .jpg .png are allowed!'))
              }
              cb(null, true)
              break
            default:
              cb(null, true)
          }
        }
      }).any()

      upload(req, res, err => {
        if (err) return reject(err)
        if (req.files.length === 0) return reject(`There is no files selected!`)

        // NOTE: use GM for image processing
        gm(req.files[0].path)
          .resize(240, 240, '!')
          .noProfile()
          .autoOrient()
          .write(`${THUMBNAIL_DIR}${req.files[0].filename}`, function (err) {
            if (!err) resolve(req.files)
          })
      })
    })
  }

  dynamicSort (property) {
    var sortOrder = 1
    if (property[0] === '-') {
      sortOrder = -1
      property = property.substr(1)
    }
    return function (a, b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
      return result * sortOrder
    }
  }
}

module.exports = new Utils()
