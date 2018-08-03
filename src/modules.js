var debug = require('debug')('bxbet')

// var reportDetailedError = require('./utils/report')

module.exports = (app) => {
  require('./utils/responses').forEach((response) => {
    app.use(response)
  })

  /**
   * catch error from myError or send badRequest
   */
  app.use((req, res, next) => {
    res['catchError'] = (error) => {
      if (error.status) res.statusCode = error.status || 400

      // let option = {}
      // reportDetailedError(error, req, res, option);

      if (!error.status) {
        return res.badRequest(error)
      }

      var response = {
        code: error.code,
        message: error.message,
        error: error.message
      }
      return res.status(error.status).json(response)
    }

    next()
  })

  var controllers = [
    'user',
    'helpers',
    'game',
    'order'
  ]

  var mongoose = require('./db')(app.get('configuration').database.connection, 'Main')
  global.db = { mongoose }

  const graphqlHTTP = require('express-graphql')
  var { schemaComposer } = require('graphql-compose')
  var TC = {schemaComposer}

  // loop through all folders in api/controllers
  var modulesRoot = './modules/'
  controllers.forEach((ctrl) => {
    const mod = require(modulesRoot + ctrl)
    mod.initModel(global.db, mongoose)

    // app.map(mod.getRoute(global.db))
    app.map(mod.getRouteV1(global.db))
    mod.getGraphql({ db: global.db, TC })
  })

  const graphqlSchema = schemaComposer.buildSchema()
  var graphqlAuth = require('./policies/graphqlAuth')

  app.use('/graphql', graphqlAuth.authMiddleware({db: global.db}), graphqlHTTP((req, res) => ({
    schema: graphqlSchema,
    graphiql: true,
    context: {
      user: req.user
    }
  })))

  /**
   * Run blockChain event watcher
   */
  const watcher = require('app/services/contract/eventWatcher')
  watcher.runWatcher(global.db)

  // catch 404
  app.use((req, res) => {
    res.notFound()
  })

  // catch 5xx
  app.use((err, req, res, next) => {
    debug(err)
    var response = {
      name: 'serverError',
      code: 'E_INTERNAL_SERVER_ERROR',
      message: 'Something bad happened on the server',
      data: {
        message: err.message
      }
    }
    res.status(500).json(response)
  })

  var config = require('app/config')
  var socket = require('socket.io-client')(config.socket.server)
  global.socket = socket
  /**
   * Send notification to online user
   * @param {object} message which message you want sent
   * @param {string} ownerId maybe user id, which receive this notification
   */
  global.sendSocketNotificationToUser = function (message, userId) {
    if (global.socket) {
      // console.log(userId, message)
      socket.emit('notification', { userId, message })
    }
  }

  /**
   * Send notification to online user
   * @param {string} userId maybe user id, which receive this notification
   * @param {object} message which message you want to send
   */
  global.sendRealTimeInfoToUsers = function (userIds, message) {
    if (global.socket) {
      socket.emit('update', { userIds, message })
    }
  }

  socket.on('connect', function () {
    console.log('connect to socket server')
  })
  socket.on('event', function (data) {
    console.log('event of socket server')
  })
  socket.on('disconnect', function () {
    console.log('disconnect socket server')
  })
}
