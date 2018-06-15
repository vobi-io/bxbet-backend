#!/usr/bin/env node
const program = require('commander')
const Promise = require('bluebird')
const times = require('lodash/times')
const colors = require('colors')
const faker = require('faker')
const config = require('../../src/config')
const { addGame, getDefaultAccount } = require('../../src/services/contract')

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
  .description('Seed games')
  .command('seed:games')
  .option('-n, --number', 'Number of games')
  .alias('seedGames')
  .parse(process.argv)
  .action(async (number) => {
    if (!number || !parseInt(number)) {
      return error('Please, specify number of users to be generated. E. g., npm run seed:games --7')
    }
    await seedData(number)
  })

const seedData = async (number) => {
  try {
    const account = await getDefaultAccount(0)
    console.log(account, 'dwadad')
    const users = times(number, async () => {
      const dtNow = Math.round(new Date() / 1000)
      const team1 = faker.address.country()
      const team2 = faker.address.country()
      const title = `${team1} vs ${team2}`
      const startDate = dtNow + faker.random.number({ min: 10000, max: 200000 })
      const endDate = startDate + faker.random.number({ min: 10000, max: 200000 })

      return addGame(title, team1, team2, 'Football', startDate, endDate, 0, account)
    })
    const results = await Promise.all(users)
    exit(`Successfully seeded ${results.length} games`)
  } catch (e) {
    error(e.message)
  }
}

program.parse(process.argv)
