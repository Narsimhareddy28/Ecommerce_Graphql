import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config.js';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './resolvers/index.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(async () => {
  await server.start();

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1];
      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return { user: decoded };
        }
      } catch {
        return { user: null };
      }
    }
  }));

  app.listen(process.env.PORT || 5002, () => {
    console.log(`Server running on port ${process.env.PORT || 5002}`);
  });
})();

export default app;