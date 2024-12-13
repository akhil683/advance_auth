import { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler, registerHandler } from "../controllers/auth.controller";

export const authRoutes = Router()

//prefix: /auth
authRoutes.post("/register", registerHandler)
authRoutes.post("/login", loginHandler)
authRoutes.post("/refresh", refreshHandler) //refresh accessToken for give refreshToken
authRoutes.post("/logout", logoutHandler)
