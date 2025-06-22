import productResolvers from './productResolvers.js';
import userResolvers from './userResolvers.js';
import categoryResolvers from './categoryResolvers.js';
import orderResolvers from './orderResolvers.js';

const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...orderResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...orderResolvers.Mutation,
  },
};

export default resolvers;