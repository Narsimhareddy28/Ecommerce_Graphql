import gql from 'graphql-tag';

const chatTypeDefs = gql`
  type ChatResponse {
    message: String!
    type: String!
    products: [Product!]!
    timestamp: String!
  }

  type ChatMessage {
    id: ID!
    message: String!
    response: String!
    timestamp: String!
    userId: ID!
  }

  extend type Query {
    getChatHistory: [ChatMessage]
  }

  extend type Mutation {
    sendChatMessage(message: String!): ChatResponse
  }
`;

export default chatTypeDefs; 