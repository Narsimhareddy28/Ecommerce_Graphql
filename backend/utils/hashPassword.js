import bcrypt from 'bcryptjs';

export const hashPassword= async (password)=>{
    if (!password) {
        throw new Error('Password is required');
    }
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

 export const  comparePassword = async (entered, hashedPassword) => {
    if (!entered || !hashedPassword) {
        throw new Error('Both password and hashed password are required');
    }
    return await bcrypt.compare(entered, hashedPassword);
}
