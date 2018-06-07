#!/usr/bin/env node
const program = require('commander')
const Promise = require('bluebird')
const times = require('lodash/times')
const sample = require('lodash/sample')
const sampleSize = require('lodash/sampleSize')
const colors = require('colors')
const faker = require('faker')
const config = require('../../src/config')
const db = require('../../src/db')(config.database.connection, 'Main')
const Utils = require('../../src/utils/Utils')
const UserModel = require('../../src/modules/user/userModel')(db)
const { listGenres } = require('../../src/modules/genres/genres')
const { listCategories } = require('../../src/modules/categories/categories')

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
  .description('Seed users')
  .command('seed:users')
  .option('-n, --number', 'Number of users')
  .alias('seedUsers')
  .parse(process.argv)
  .action(async (number) => {
    if (!number || !parseInt(number)) {
      return error('Please, specify number of users to be generated. E. g., npm run seed:users --7')
    }
    await seedData(number)
  })

const seedData = async (number) => {
  try {
    const users = times(number, async () => {
      const user = new UserModel({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        role: sample(['talent', 'booker', 'bookingAgent']),
        category: sampleSize(listCategories, 2),
        genres: sampleSize(listGenres, 2),
        password: Utils.generateHash('1234'),
        isVerified: true,
        confirmed: true,
        location: `${faker.address.city()}, ${faker.address.country()}`,
        birthDate: faker.date.between(new Date(1900, 1, 1), new Date(2000, 1, 1)),
        phone: faker.phone.phoneNumber(),
        bookingInfo: {
          minRate: faker.random.number({ min: 100, max: 200 })
        }
      })
      return user.save()
    })
    const results = await Promise.all(users)
    exit(`Successfully seeded ${results.length} users`)
  } catch (e) {
    error(e.message)
  }
}

program.parse(process.argv)
