import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
  } catch (e) {
    console.log("Error connection to MongoDB", e.message)
    process.exit(1)
  }
}
