import { Order } from "../models/Orders.js";
import { Product } from "../models/Products.js";

export const orderResolvers = {
    Query: {
        getMyOrders: async (_, __, context) => {
            if (!context.user) {
                throw new Error('Authentication required');
            }
            return await Order.find({ customerId: context.user.id }).populate('products.product');
        },

        getAllOrders: async (_, __, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Access denied');
            }
            return await Order.find().populate('products.product');
        },

        getOrdersBySeller: async (_, __, context) => {
            if (!context.user || context.user.role !== 'seller') {
                throw new Error('Access denied');
            }
            return await Order.find({ 'products.product.sellerId': context.user.id }).populate('products.product');
        },




    },
    Mutation: {
        createOrder: async (_, { products, totalAmount }, context) => {

            if (!context.user || context.user.role !== 'customer') {
                throw new Error('Only customers can place orders');
            }
            if (!products || products.length === 0) {
                throw new Error('At least one product is required');
            }
  let total = 0;

            const validProducts = await Promise.all(
                products.map(async ({ product, quantity }) => {
                    const found = await Product.findById(product);
                    if (!found) throw new Error(`Product not found: ${product}`);

                total+= found.price * quantity;
                    return { product, quantity };
                })
            );
            const order = await Order.create({
                products: validProducts,
                totalAmount: total,
                customerId: context.user.id
            });

            return await order.populate('products.product');
        },

        updateOrderStatus: async (_, { id, status }, context) => {
            if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
                throw new Error('Access denied');
            }

            const order = await Order.findById(id).populate('products.product');
            if (!order) throw new Error('Order not found');

            // If seller, ensure at least one product belongs to them
            if (
                context.user.role === 'seller' &&
                !order.products.some(p => p.product.sellerId.toString() === context.user.id)
            ) {
                throw new Error('Cannot update order not containing your products');
            }

            order.status = status;
            await order.save();
            return order;
        }
    }
};

export default orderResolvers;