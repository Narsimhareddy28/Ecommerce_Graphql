import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = (token) => {
    if (!token){
        throw new Error('Token is required for verification');
    }
    try{
        return jwt.verify(token, process.env.JWT_SECRET);

    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
export default verifyToken;