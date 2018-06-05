
const getRepository = (db) => {
  var GameRepository = require('./gameRepository')
  return new GameRepository({db})
}

const getCtrl = (db) => {
  var GameController = require('./gameController')
  return new GameController({db, gameRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./gameRoutes.v1')
  return RouteV1({isAuthenticated, ctrl: getCtrl(db)})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./gameGraphql')({ GameModel: db.GameModel, isAuthenticated, TC })
}

module.exports = {
  getCtrl,
  getRepository,
  getRouteV1,
  getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.GameModel = require('./gameModel')(mongoose)
  }
}
