import mongoose from 'mongoose';



async function dbConnect(): Promise<void> {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI as string, {
        });

        console.log(`Database is connected at ${con.connection.host}`);
    } catch (error) {
        console.error("Error while connecting to the database", error);
        process.exit(1)
    }
}

export default dbConnect;
