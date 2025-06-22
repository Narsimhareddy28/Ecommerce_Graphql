import gql from 'graphql-tag';

 const orderTypeDefs = gql`
  type OrderProduct {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    products: [OrderProduct!]!
    totalAmount: Float!
    customerId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  input OrderProductInput {
    product: ID!
    quantity: Int!
  }

  extend type Query {
    getMyOrders: [Order]
    getAllOrders: [Order]          
    getOrdersBySeller: [Order]      
  }

  extend type Mutation {
    createOrder(products: [OrderProductInput!]!): Order
    updateOrderStatus(id: ID!, status: String!): Order  # admin/seller only
  }
`;

export default orderTypeDefs;
