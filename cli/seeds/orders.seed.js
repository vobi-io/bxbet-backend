#!/usr/bin/env node
const program = require('commander')
const Promise = require('bluebird')
const times = require('lodash/times')
const colors = require('colors')
const faker = require('faker')
const config = require('../../src/config')
const db = require('../../src/db')(config.database.connection, 'Main')
const Utils = require('../../src/utils/Utils')
const GameModel = require('../../src/modules/game/gameModel')(db)
const { placeOrder } = require('../../src/services/contract')

const exit = message => {
  program.outputHelp(() => colors.green(message))
  process.exit()
}

const error = msg => {
  program.outputHelp(() => colors.red(msg))
  process.exit()
}

program
  .version('0.0.1')
  .description('Seed orders')
  .command('seed:orders')
  .option('-n, --number', 'Number of games')
  .alias('seedOrders')
  .parse(process.argv)
  .action(async (number) => {
    if (!number || !parseInt(number)) {
      return error('Please, specify number of users to be generated. E. g., npm run seed:orders --7')
    }
    await seedData(number)
  })

const seedData = async (number) => {
  try {
    const users = times(number, async () => {
      const gameId = faker.random.number({ min: 1, max: 10 })
      const orderType = faker.random.number({ min: 0, max: 1 })
      const amount = faker.random.number({ min: 50, max: 100 })
      const outcome = faker.random.number({ min: 0, max: 2 })
      const odd = faker.random.number({ min: 1, max: 2 })
      const dtNow = Math.round(new Date() / 1000)
      return placeOrder(gameId, orderType, amount, odd, outcome, dtNow)
    })
    const results = await Promise.all(users)
    console.log(results)
    exit(`Successfully seeded ${results.length} orders`)
  } catch (e) {
    error(e.message)
  }
}

program.parse(process.argv)
