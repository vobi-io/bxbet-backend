'use strict'
console.log(11)
var { addGame, getGame } = require('./bxbet')
console.log(222)
const seed = async () => {
  const dtNow = Math.round(new Date() / 1000)
  const game1 = await addGame('Germany vs Italy', 'Germany', 'Italy', 'Football', dtNow + 10000, dtNow + 40000, 0)
  console.log(game1)
  addGame('Georgia vs Russia', 'Georgia', 'Russia', 'Football', dtNow + 10000, dtNow + 40000, 0)

  const a = await getGame(1)
  console.log(a)
}

module.exports = {
  seed
}
