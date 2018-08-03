
const getRepository = (db) => {
  var gameModule = require('app/modules/game')
  var OrderRepository = require('./orderRepository')
  return new OrderRepository({db, gameRepository: gameModule.getRepository(db)})
}

const getCtrl = (db) => {
  var OrderController = require('./orderController')
  return new OrderController({db, orderRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./orderRoutes.v1')
  return RouteV1({isAuthenticated, ctrl: getCtrl(db)})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./orderGraphql')({ OrderModel: db.OrderModel,
    isAuthenticated,
    TC,
    orderRepository: getRepository(db) })
}

module.exports = {
  getCtrl,
  getRepository,
  getRouteV1,
  getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.OrderModel = require('./orderModel')(mongoose)
  }
}
