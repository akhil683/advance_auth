import { Router } from "express";
import { loginHandler, logoutHandler, registerHandler } from "../controllers/auth.controller";

export const authRoutes = Router()

//prefix: /auth
authRoutes.post("/register", registerHandler)
authRoutes.post("/login", loginHandler)
authRoutes.post("/logout", logoutHandler)
