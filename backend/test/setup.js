import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

console.log('Test environment variables loaded');
beforeAll(async()=>{
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
})

afterAll(async()=>{
   await mongoose.connection.dropDatabase(); // clear data after test
  await mongoose.connection.close();
})
