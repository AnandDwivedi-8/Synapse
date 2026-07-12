import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully.');
        return true;
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        console.error('Failed to connect to MongoDB. Make sure:');
        console.error('1. MongoDB is running');
        console.error('2. MONGO_URI in .env is correct');
        console.error('3. Check if port 27017 is available');
        process.exit(1);
    }
}
export default connectDB;