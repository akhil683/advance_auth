"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verificationCodeSchema = exports.registerSchema = exports.loginSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().email().min(1).max(255);
exports.passwordSchema = zod_1.z.string().min(6).max(255);
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    userAgent: zod_1.z.string().optional(),
});
exports.registerSchema = exports.loginSchema.extend({
    confirmPassword: zod_1.z.string().min(6).max(255),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"]
});
exports.verificationCodeSchema = zod_1.z.string().min(1).max(24);
exports.resetPasswordSchema = zod_1.z.object({
    password: exports.passwordSchema,
    verificationCode: exports.verificationCodeSchema
});
