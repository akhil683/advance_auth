import { Router } from "express";
import { registerHandler } from "../controllers/auth.controller";

export const authRoutes = Router()

authRoutes.post("/register", registerHandler)

//prefix: /auth
