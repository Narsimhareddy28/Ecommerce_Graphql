import { Product } from '../models/Products.js';

export const productResolvers = {
  Query: {
    getAllProducts: async () => {
      return await Product.find().populate('category');
    },

    getProduct: async (_, { id }) => {
      const product = await Product.findById(id).populate('category');
      if (!product) throw new Error('Product not found');
      return product;
    },

    getProductsByCategory: async (_, { categoryId }) => {
      return await Product.find({ category: categoryId }).populate('category');
    },

    getProductsBySeller: async (_, __, context) => {
      if (!context.user || context.user.role !== 'seller') {
        throw new Error('Only sellers can view their products');
      }
      return await Product.find({ sellerId: context.user.id }).populate('category');
    }
  },

  Mutation: {
    addProduct: async (_, args, context) => {
      if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
        throw new Error('Only admin or seller can add products');
      }

      const product = new Product({
        ...args,
        sellerId: context.user.id
      });

      await product.save();
      return await product.populate('category');
    },

    updateProduct: async (_, { id, ...updates }, context) => {
      if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
        throw new Error('Unauthorized');
      }

      const product = await Product.findById(id);
      if (!product) throw new Error('Product not found');

      // Only allow seller who created it or admin
      if (
        context.user.role === 'seller' &&
        product.sellerId.toString() !== context.user.id
      ) {
        throw new Error('Access denied');
      }

      Object.assign(product, updates);
      await product.save();
      return await product.populate('category');
    },

    deleteProduct: async (_, { id }, context) => {
      if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
        throw new Error('Unauthorized');
      }

      const product = await Product.findById(id);
      if (!product) throw new Error('Product not found');

      if (
        context.user.role === 'seller' &&
        product.sellerId.toString() !== context.user.id
      ) {
        throw new Error('Access denied');
      }

      await product.deleteOne();
      return true;
    }
  }
};

export default productResolvers;