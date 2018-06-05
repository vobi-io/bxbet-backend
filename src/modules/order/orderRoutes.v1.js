
module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/order': {
      get: [isAuthenticated, ctrl.listOrder.bind(ctrl)],
      post: [isAuthenticated, ctrl.createOrder.bind(ctrl)],
      '/:id': {
        get: [isAuthenticated, ctrl.listOrder.bind(ctrl)],
        delete: [isAuthenticated, ctrl.deleteOrder.bind(ctrl)],
        put: [isAuthenticated, ctrl.editOrder.bind(ctrl)]
      }
    }
  }
}
