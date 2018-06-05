/* eslint camelcase:0 */
'use strict'
// var OrderRepository = require('./eventRepository')
var Utils = require('../../utils/Utils')
var Promise = require('bluebird')
const roles = require('../roles/roles').roles

class OrderController {
  constructor ({eventRepository}) {
    this.eventRepository = eventRepository
  }

   /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/event Create event
   * @apiName CreateOrder
   * @apiGroup Order
   * @apiPermission Authorization
   * @apiDescription Create event
   *
   * @apiUse OrderModel
   *
   * @apiUse defaultSuccessExample201
   * @apiUse Errors
   */
  createOrder (req, res) {
    let options = {}
    global.db.OrderModel.httpPost(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/event/:id Edit Order
   * @apiName EditOrder
   * @apiGroup Order
   * @apiPermission Authorization
   * @apiDescription Edit Order data
   *
   * @apiParam {string} id Order unique ID.
   * @apiUse OrderModel
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  editOrder (req, res) {
    let options = {}
    global.db.OrderModel.httpPut(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/event/:id Delete Order
   * @apiName DeleteOrder
   * @apiGroup Order
   * @apiPermission Authorization
   * @apiDescription Delete Order from project.
   *
   * @apiParam {string} id Order unique ID.
   * @apiUse OrderModelSuccess
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  deleteOrder (req, res) {
    let options = {}
    // const {_id: userId} = req.user
    req.body.status = 'deleted'
    global.db.OrderModel.httpPut(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/event?pageSize=:pageSize&page=:page&sort=:sort&select=:select&where=:where&populate=:populate Get Task List by User
   * @apiName getOrderList
   * @apiGroup Order
   * @apiPermission Authorization
   * @apiDescription Get Order list by User
   *
   * @apiUse defaultQueryParams
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  listOrder (req, res) {
    let where = {
      user: req.user._id,
      status: {$ne: 'deleted'}
    }
    const options = {where}
    global.db.OrderModel.httpGet(req, res, options)
  }

}

module.exports = OrderController
