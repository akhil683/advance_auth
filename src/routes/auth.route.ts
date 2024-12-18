import { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler, registerHandler, resetPasswordHandler, sendPasswordResetHandler, verifyEmailHandler } from "../controllers/auth.controller";

export const authRoutes = Router()

//prefix: /auth
authRoutes.post("/register", registerHandler)
authRoutes.post("/login", loginHandler)
authRoutes.post("/refresh", refreshHandler) //refresh accessToken for give refreshToken
authRoutes.post("/logout", logoutHandler)
authRoutes.post("/email/verify/:code", verifyEmailHandler)
authRoutes.post("/password/forgot", sendPasswordResetHandler)
authRoutes.post("/password/reset", resetPasswordHandler)
