import gql from 'graphql-tag';

 const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String
  }

  extend type Query {
    getAllCategories: [Category]
    getCategory(id: ID!): Category
    getCategoriesBySeller: [Category]
  }

  extend type Mutation {
    addCategory(name: String!, description: String): Category
    updateCategory(id: ID!, name: String, description: String): Category
    deleteCategory(id: ID!): Boolean
  }
`;

export default categoryTypeDefs;