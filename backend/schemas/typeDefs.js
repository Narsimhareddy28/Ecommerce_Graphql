import { mergeTypeDefs } from '@graphql-tools/merge';
import productTypeDefs from './productDefs.js';
import userTypeDefs from './userDefs.js';
import categoryTypeDefs from './categoryDefs.js';
import baseTypeDefs  from './baseTypeDefs.js';
import orderTypeDefs from './orderDefs.js';
import chatTypeDefs from './chatDefs.js';
const typeDefs = mergeTypeDefs([
    baseTypeDefs,
  productTypeDefs,
  userTypeDefs,
  categoryTypeDefs,
  orderTypeDefs,
  chatTypeDefs
]);

export default typeDefs;