import { Router } from "express";
import { getUserHandler } from "../controllers/user.controller";

export const userRoutes = Router()

//prefix: /user

userRoutes.get("/", getUserHandler)
