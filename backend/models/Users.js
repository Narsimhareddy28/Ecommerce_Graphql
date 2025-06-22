import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    role : {
        type: String,
        enum: ['customer', 'admin', 'seller'],
        default: 'customer'
    },

},
{ timestamps: true }
);

export const User = mongoose.model('User', userSchema);
