
module.exports = {
  getCtrl: (db) => null,
  getRepository: (db) => null,
  getRouteV1: (db) => null,
  getGraphql: (db) => null,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    var bxBet = require('./bxbet')
    var gameRepository = require('app/modules/game').getRepository(db)

    bxBet.setupGameEventListener(gameRepository.saveGame)
  }
}
