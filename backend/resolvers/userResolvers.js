import { User } from '../models/Users.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import generateToken from '../utils/generateToken.js';


export const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findById(context.user.id);
    },
    getAllUsers: async (_, __, context) => {
      if (context.user?.role !== 'admin') throw new Error('Access denied');
      return await User.find();
    },
    getUser: async (_, { id }, context) => {
      if (!context.user || (context.user.role !== 'admin' && context.user.id !== id)) {
        throw new Error('Access denied');
      }
      return await User.findById(id);
    },
  },

  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('User already exists');

      const hashed = await hashPassword(password);
      const user = await User.create({
        name,
        email,
        password: hashed,
        role: role || 'customer'
      });

      const token = generateToken(user);
      return { id: user._id, name: user.name, email: user.email, role: user.role, token };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      const token = generateToken(user);
      return { id: user._id, name: user.name, email: user.email, role: user.role, token };
    },

    deleteUser: async (_, { id }, context) => {
      if (context.user?.role !== 'admin') throw new Error('Access denied');
      await User.findByIdAndDelete(id);
      return true;
    }
  }
};

export default userResolvers;
