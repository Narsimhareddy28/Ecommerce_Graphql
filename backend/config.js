import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        })
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDb1j1aM7LjuKbvJBS6Nrsb1OP1o2ssJmY';

export default connectDB;
