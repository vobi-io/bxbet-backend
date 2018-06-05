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

  setTimeout(() => {
    var test = require('app/services/contract/seed')
    test.seed()
  }, 5000)
}
