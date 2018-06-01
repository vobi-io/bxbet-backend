'use strict'

const addOneToOneRelation = ({
  ModelTC,
  RelationTC,
  name,
  relPropName
}) => {
  ModelTC.addRelation(
    name,
    {
      resolver: () => RelationTC.getResolver('findById'),
      prepareArgs: {
        _id: source => source[relPropName || name]
      },
      projection: {
        [relPropName || name]: true
      }
    }
  )
}

// const addOneToManyRelation = ({
//   ModelTC,
//   RelationTC,
//   name,
//   relPropName
// }) => {
//   ModelTC.addRelation(
//     name,
//     {
//       resolver: () => RelationTC.getResolver('findMany'),
//       prepareArgs: {
//         _id: source => source[relPropName || name]
//       },
//       projection: {
//         [relPropName || name]: true
//       }
//     }
//   )
// }

module.exports = {
  addOneToOneRelation
}
