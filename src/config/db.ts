import mongoose from "mongoose"
import { MONGO_URI } from "../constants/env"

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("Successfully connect to DB")
  } catch (err) {
    console.log("Could not connect to DB", err)
  }
}

export default connectDB
