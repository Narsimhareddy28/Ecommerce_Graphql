import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
    if (!user || !user._id) {
        throw new Error('User object with _id is required to generate a token');
    }
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role 
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export default generateToken;