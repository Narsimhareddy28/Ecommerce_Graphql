import gql from 'graphql-tag';

 const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    images: [String]
    category: Category!
    sellerId: ID!
  }

  extend type Query {
    getAllProducts: [Product]
    getProduct(id: ID!): Product
    getProductsByCategory(categoryId: ID!): [Product]
    getProductsBySeller: [Product]
  }

  extend type Mutation {
    addProduct(
      name: String!
      description: String
      price: Float!
      images: [String]
      category: ID!
    ): Product

    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      images: [String]
      category: ID
    ): Product

    deleteProduct(id: ID!): Boolean
  }
`;

export default productTypeDefs;