"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
exports.authRoutes = (0, express_1.Router)();
//prefix: /auth
exports.authRoutes.post("/register", auth_controller_1.registerHandler);
exports.authRoutes.post("/login", auth_controller_1.loginHandler);
exports.authRoutes.post("/refresh", auth_controller_1.refreshHandler); //refresh accessToken for give refreshToken
exports.authRoutes.post("/logout", auth_controller_1.logoutHandler);
exports.authRoutes.post("/email/verify/:code", auth_controller_1.verifyEmailHandler);
exports.authRoutes.post("/password/forgot", auth_controller_1.sendPasswordResetHandler);
exports.authRoutes.post("/password/reset", auth_controller_1.resetPasswordHandler);
