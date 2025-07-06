import { Order } from "../models/Orders.js";
import { Product } from "../models/Products.js";

// Helper function to transform order data for GraphQL
const transformOrder = (order) => {
    const orderObj = order.toObject();
    
    return {
        ...orderObj,
        id: order._id.toString(),
        customerId: order.customerId.toString(),
        products: orderObj.products.map(p => ({
            quantity: p.quantity, // Ensure quantity is preserved
            product: {
                ...p.product,
                id: p.product._id.toString(),
                sellerId: p.product.sellerId.toString(),
                category: p.product.category ? {
                    ...p.product.category,
                    id: p.product.category._id.toString()
                } : null
            }
        }))
    };
};

export const orderResolvers = {
    Query: {
        getMyOrders: async (_, __, context) => {
            console.log('=== GET MY ORDERS DEBUG ===');
            console.log('User:', context.user);
            
            if (!context.user) {
                throw new Error('Authentication required');
            }
            
            const orders = await Order.find({ customerId: context.user.id })
                .populate({
                    path: 'products.product',
                    populate: {
                        path: 'category'
                    }
                });
            console.log(`Found ${orders.length} orders for user ${context.user.id}`);
            
            // Log detailed order structure
            orders.forEach((order, index) => {
                console.log(`Order ${index}:`, {
                    id: order._id,
                    products: order.products.map(p => ({
                        quantity: p.quantity,
                        product: p.product ? {
                            id: p.product._id,
                            name: p.product.name,
                            price: p.product.price
                        } : 'null'
                    }))
                });
            });
            
            const transformedOrders = orders.map(transformOrder);
            console.log('Transformed orders:', JSON.stringify(transformedOrders, null, 2));
            console.log('=== END GET MY ORDERS DEBUG ===');
            
            return transformedOrders;
        },

        getAllOrders: async (_, __, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Access denied');
            }
            const orders = await Order.find().populate({
                path: 'products.product',
                populate: {
                    path: 'category'
                }
            });
            return orders.map(transformOrder);
        },

        getOrdersBySeller: async (_, __, context) => {
            if (!context.user || context.user.role !== 'seller') {
                throw new Error('Access denied');
            }
            const orders = await Order.find({ 'products.product.sellerId': context.user.id }).populate({
                path: 'products.product',
                populate: {
                    path: 'category'
                }
            });
            return orders.map(transformOrder);
        },




    },
    Mutation: {
        createOrder: async (_, { products, totalAmount }, context) => {
            console.log('=== CREATE ORDER DEBUG ===');
            console.log('User:', context.user);
            console.log('Products input:', products);
            console.log('Total amount input:', totalAmount);

            if (!context.user || context.user.role !== 'customer') {
                throw new Error('Only customers can place orders');
            }
            if (!products || products.length === 0) {
                throw new Error('At least one product is required');
            }
            
            let total = 0;

            const validProducts = await Promise.all(
                products.map(async ({ product, quantity }) => {
                    console.log(`Looking for product: ${product}`);
                    const found = await Product.findById(product);
                    if (!found) throw new Error(`Product not found: ${product}`);
                    
                    console.log(`Found product: ${found.name}, price: ${found.price}, quantity: ${quantity}`);
                    total += found.price * quantity;
                    return { product, quantity };
                })
            );
            
            console.log('Valid products:', validProducts);
            console.log('Calculated total:', total);
            
            const order = await Order.create({
                products: validProducts,
                totalAmount: total,
                customerId: context.user.id
            });
            
            console.log('Created order:', order);
            
            const populatedOrder = await order.populate({
                path: 'products.product',
                populate: {
                    path: 'category'
                }
            });
            console.log('Populated order:', populatedOrder);
            
            const transformedOrder = transformOrder(populatedOrder);
            console.log('Transformed order:', transformedOrder);
            console.log('=== END CREATE ORDER DEBUG ===');
            
            return transformedOrder;
        },

        updateOrderStatus: async (_, { id, status }, context) => {
            if (!context.user || !['admin', 'seller'].includes(context.user.role)) {
                throw new Error('Access denied');
            }

            const order = await Order.findById(id).populate({
                path: 'products.product',
                populate: {
                    path: 'category'
                }
            });
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
            return transformOrder(order);
        }
    }
};

export default orderResolvers;