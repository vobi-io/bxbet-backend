console.log("giooo")


var scenarios = require('../../utils/scenarios')

var random = Math.floor(Math.random() * Math.floor(3)).toString()

scenarios[random].map((item) => {
    console.log(item)
    //placeOrder()
})


// Object.keys(scenarios[random]).map((key) => {

//     scenarios[random].sellOrders[key].map(item => {

//     })
// })
