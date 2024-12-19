"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const http_1 = require("../constants/http");
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    (0, AppAssert_1.default)(accessToken, http_1.UNAUTHORIZED, "Not Authorized", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    //If user had a cookie
    const { error, payload } = (0, jwt_1.verifyToken)(accessToken);
    (0, AppAssert_1.default)(payload, http_1.UNAUTHORIZED, error === "jwt expired" ? "Token expired" : "Invalid Token", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
};
exports.default = authenticate;
