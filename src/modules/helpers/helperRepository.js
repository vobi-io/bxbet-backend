/* eslint handle-callback-err:0 */
'use strict'
var Promise = require('bluebird')
var config = require('app/config')
var debug = require('debug')('bxbet:helper')

class HelperRepo {

  constructor (db) {
    this.db = db
  }

  async uploadPropertyPhoto (id, leaseId, filename) {
    return global.db.TenantModel.findOne({_id: id})
.then(tenant => {
  console.log(id)
  if (!tenant) {
    return Promise.reject({message: 'data not found!'})
  }
  const leases = tenant.lease.map(item => {
    if (item._id.toString() === leaseId) {
      item.photo = filename
    }
    return item
  })
  tenant.lease = leases
  return tenant.save()
}).then(tenant => Promise.resolve(tenant))
  }

}

module.exports = HelperRepo

