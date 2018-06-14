#!/usr/bin/env node
const program = require('commander')
const colors = require('colors')
const { finishGame } = require('../src/services/contract')

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
  .description('Finish game')
  .command('finish:game <gameId> <outcome>')
  .alias('finishGame')
  .parse(process.argv)
  .action(async (number) => {
    if (!number || !parseInt(number)) {
      return error('Please, specify number of users to be generated. E. g., npm run finish:game 7 0')
    }
    await seedData(number)
  })

const seedData = async (gameId, outcome) => {
  try {
    const result = await finishGame(Number(gameId), Number(outcome))

    console.log(result)
    exit(`Successfully finished game`)
  } catch (e) {
    error(e.message)
  }
}

program.parse(process.argv)
