import ecommerceAgent from '../services/ecommerceAgent.js';

export const chatResolvers = {
  Query: {
    // Get chat history (we can implement this later if needed)
    getChatHistory: async (_, __, context) => {
      // For now, return empty array - we can implement chat history storage later
      return [];
    }
  },

  Mutation: {
    sendChatMessage: async (_, { message }, context) => {
      try {
        console.log('=== CHAT MESSAGE DEBUG ===');
        console.log('User message:', message);
        console.log('User context:', context.user);

        // Use LangGraph agent for intelligent processing
        const response = await ecommerceAgent.processMessage(message);

        console.log('AI Response:', response);
        console.log('=== END CHAT MESSAGE DEBUG ===');

        // Transform products to include proper IDs
        const transformedProducts = response.products.map(product => ({
          ...product.toObject(),
          id: product._id.toString(),
          sellerId: product.sellerId.toString(),
          category: product.category ? {
            ...product.category.toObject(),
            id: product.category._id.toString()
          } : null
        }));

        return {
          message: response.message,
          type: response.type,
          products: transformedProducts,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error in sendChatMessage:', error);
        return {
          message: 'Sorry, I encountered an error while processing your message. Please try again.',
          type: 'error',
          products: [],
          timestamp: new Date().toISOString()
        };
      }
    }
  }
};

export default chatResolvers; 