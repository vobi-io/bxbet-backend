
var { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const customizationOptions = {} // left it empty for simplicity, described below

module.exports = ({EventModel, isAuthenticated, TC}) => {
  const {schemaComposer, UserTC} = TC
  const EventTC = composeWithMongoose(EventModel, customizationOptions)

  EventTC.addRelation('userObj',
    {
      resolver: () => UserTC.getResolver('findById'),
      prepareArgs: {
        filter: source => ({ _id: source.user })
      },
      projection: { user: true }
    }
  )

  // const extendedResolver = ProductTC.getResolver('findMany').addFilterArg({
  //   name: 'nameRegexp',
  //   type: 'String',
  //   description: 'Search by regExp',
  //     query: (query, value, rp) => { // eslint-disable-line
  //       query.name = new RegExp(value, 'i'); // eslint-disable-line
  //     }
  // })
  // extendedResolver.name = 'findMany'
  // ProductTC.addResolver(extendedResolver)

  // EventTC.addRelation('last10Articles', {
  //   resolver: () => EventTC.getResolver('findMany'),
  //   prepareArgs: {
  //     filter: source => ({ userId: `${source._id}` }), // calculate `filter` argument
  //     limit: 10, // set value to `limit` argument
  //     sort: { _id: -1 }, // set `sort` argument
  //     skip: null // remove `skip` argument
  //   },
  //   projection: { _id: true }
  // })

  // const findManyResolver = EventTC.getResolver('findMany').addFilterArg({
  //   name: 'fullTextSearch',
  //   type: 'String',
  //   description: 'Fulltext search with mongodb stemming and weights',
  //   query: (query, value, rp) => {
  //     rp.args.sort = {
  //       score: { $meta: 'textScore' }
  //     }
  //     query.$text = { $search: value, $language: 'ru' }
  //     rp.projection.score = { $meta: 'textScore' }
  //   }
  // })
  // EventTC.setResolver('findMany1', findManyResolver)

  const findResolverByUser = next => rp => {
    const { user } = rp.context
    if (!rp.args.filter) {
      rp.args.filter = {}
    }
    rp.args.filter.user = user
    return next(rp)
  }

  const findByIdResolverByUser = (next) => async (rp) => {
    const result = await next(rp)
    if (result.user !== rp.context.user) {
      throw new Error('Not allowed')
    }
    return result
  }

  const createOneWithUser = next => (rp) => {
    // rp.args.record.user = rp.context.user._id
    return next(rp)
  }

  const updateOne = next => req => {
    if (req.context.user._id !== req.args.input.record._id) {
      throw new Error('Not allowed')
    }      // Add restaurant to the array in user and in restaurant.followerIds

    delete req.args.input.record.visited
    delete req.args.input.record.restaurant
    return next(req)
  }

  schemaComposer.rootQuery().addFields({
    eventById: EventTC.getResolver('findById').wrapResolve(findByIdResolverByUser),
    eventByIds: EventTC.get('$findByIds'),
    eventOne: EventTC.get('$findOne').wrapResolve(findResolverByUser),
    eventMany: EventTC.get('$findMany').wrapResolve(findResolverByUser),
    eventCount: EventTC.get('$count'),
    eventConnection: EventTC.get('$connection'),
    eventPagination: EventTC.get('$pagination')
  })

  schemaComposer.rootMutation().addFields({
    eventCreate: EventTC.getResolver('createOne').wrapResolve(createOneWithUser),
    eventUpdateById: EventTC.getResolver('updateById'),
    eventUpdateOne: EventTC.getResolver('updateOne'),
    eventUpdateMany: EventTC.getResolver('updateMany'),
    eventRemoveById: EventTC.getResolver('removeById'),
    eventRemoveOne: EventTC.getResolver('removeOne'),
    eventRemoveMany: EventTC.getResolver('removeMany')
  })

  TC.EventTC = EventTC
  return EventTC
}
