
const getRepository = (db) => {
  var EventRepository = require('./eventRepository')
  return new EventRepository({db})
}

const getCtrl = (db) => {
  var EventController = require('./eventController')
  return new EventController({db, eventRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./eventRoutes.v1')
  return RouteV1({isAuthenticated, ctrl: getCtrl(db)})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./eventGraphql')({ EventModel: db.EventModel, isAuthenticated, TC })
}

module.exports = {
  getCtrl,
  getRepository,
  getRouteV1,
  getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.EventModel = require('./eventModel')(mongoose)
  }
}
