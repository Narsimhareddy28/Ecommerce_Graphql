import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    products:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['placed', 'shipped', 'delivered', 'cancelled'],
        default: 'placed'
    }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);