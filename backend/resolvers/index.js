import productResolvers from './productResolvers.js';
import userResolvers from './userResolvers.js';
import categoryResolvers from './categoryResolvers.js';
import orderResolvers from './orderResolvers.js';
import chatResolvers from './chatResolvers.js';

const resolvers = {
  Query: {
    ...productResolvers.Query,
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...orderResolvers.Query,
    ...chatResolvers.Query,
  },
  Mutation: {
    ...productResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...chatResolvers.Mutation,
  },
};

export default resolvers;