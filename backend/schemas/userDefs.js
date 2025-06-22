import gql from 'graphql-tag';

 const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    token: String
  }

  extend type Query {
    me: User
    getAllUsers: [User]         
    getUser(id: ID!): User      
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!, role: String): User
    login(email: String!, password: String!): User
    deleteUser(id: ID!): Boolean
  }
`;

export default userTypeDefs;
