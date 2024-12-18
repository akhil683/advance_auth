import "dotenv/config"
import express from "express";
import cors from "cors"
import connectDB from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import { authRoutes } from "./routes/auth.route";
import authenticate from "./middleware/authenticate";
import { userRoutes } from "./routes/user.route";


const app = express()

app.use(express.json())// allows us to parse incoming req with JSON payload : req.body
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
)
app.use(cookieParser())

app.get("/",
  (req, res: any, next) => {
    return res.status(OK).json({
      status: "healthy",
    })
  }
)

//Auth Routes
app.use("/auth", authRoutes)

// Protected Routes
app.use("/user", authenticate, userRoutes)

//Error handler middleware
app.use(errorHandler)

app.listen(PORT, async () => {
  await connectDB()
  console.log(`Server is running on PORT ${PORT} in ${NODE_ENV} environment`)
})

