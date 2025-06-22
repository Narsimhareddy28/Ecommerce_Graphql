import { mergeTypeDefs } from '@graphql-tools/merge';
import productTypeDefs from './productDefs.js';
import userTypeDefs from './userDefs.js';
import categoryTypeDefs from './categoryDefs.js';
import baseTypeDefs  from './baseTypeDefs.js';
import orderTypeDefs from './orderDefs.js';
const typeDefs = mergeTypeDefs([
    baseTypeDefs,
  productTypeDefs,
  userTypeDefs,
  categoryTypeDefs,
  orderTypeDefs
]);

export default typeDefs;