"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../constants/http");
const zod_1 = require("zod");
const AppError_1 = __importDefault(require("../utils/AppError"));
const cookies_1 = require("../utils/cookies");
const handleError = (res, error) => {
    const errors = error.issues.map(err => ({
        path: err.path.join("."),
        message: err.message
    }));
    return res.status(http_1.BAD_REQUEST).json({
        message: error.message,
        errors
    });
};
const handleAppError = (res, error) => {
    return res.status(error.statusCode).json({
        messgae: error.message,
        errorCode: error.errorCode,
    });
};
const errorHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);
    //Clear auth cookie when any error occur in this path
    if (req.path === cookies_1.REFRESH_PATH) {
        (0, cookies_1.clearAuthCookies)(res);
    }
    if (error instanceof zod_1.z.ZodError) {
        return handleError(res, error);
    }
    if (error instanceof AppError_1.default) {
        return handleAppError(res, error);
    }
    return res.status(http_1.INTERNAL_SERVER_ERROR).send("Internal Server Error");
};
exports.default = errorHandler;
