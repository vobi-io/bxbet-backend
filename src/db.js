module.exports = (connection, name = '') => {
  // configure & connect to db
  var mongoose = require('mongoose')
  mongoose.Promise = global.Promise // set native promise

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development_local') {
    mongoose.set('debug', true)
  }

  /**
   * mongoose configuration
   * @type {boolean}
   */

  var lastReconnectAttempt
  var mongoConnectOptions = {
    useMongoClient: true,
    promiseLibrary: global.Promise,
    poolSize: 5,
    autoReconnect: true
  }

    // Public / External IP from DO.
    // 104.131.25.164
  var connect = () => {
    mongoose.connect(connection, mongoConnectOptions)
  }
  connect()

  mongoose.connection.on('error', (error) => {
    console.log(`Could not connect to MongoDB: (${name}).`)
    console.log('ERROR =>' + error)
  })

  mongoose.connection.on('disconnected', () => {
    console.log(`Lost MongoDB (${name}) connection...`)
    var now = new Date().getTime()
    if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
      // if it does, delay the next attempt
      var delay = 5000 - (now - lastReconnectAttempt)
      console.log(`reconnecting to MongoDB (${name}). in ` + delay + 'mills')
      setTimeout(function() {
        console.log(`reconnecting to MongoDB: (${name}).`)
        lastReconnectAttempt = new Date().getTime()
        connect()
      }, delay)
    } else {
      console.log(`reconnecting to MongoDB (${name})`)
      lastReconnectAttempt = now
      connect()
    }
  })

  mongoose.connection.on('connected', () => {
    console.log(`Connection established to MongoDB: (${name})`)
  })

  mongoose.connection.on('reconnected', () => {
    console.log(`Reconnected to MongoDB (${name})`)
  })

  return mongoose
}
