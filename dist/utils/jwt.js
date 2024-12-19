"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = exports.RefreshTokenSignOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const defaults = {
    audience: ['user'],
};
const accessTokenSignOptions = {
    expiresIn: "15m",
    // TODO: secret: JWT_SECRET
    secret: "mysecretkey",
};
exports.RefreshTokenSignOptions = {
    expiresIn: "30d",
    // TODO: secret: JWT_REFRESH_TOKEN
    secret: "myjwtrefreshsecret"
};
const signToken = (payload, options) => {
    const { secret, ...signOpts } = options || accessTokenSignOptions;
    return jsonwebtoken_1.default.sign(payload, secret, {
        ...defaults,
        ...signOpts
    });
};
exports.signToken = signToken;
const verifyToken = (token, options) => {
    //TODO: const { secret = JWT_SECRET, ...verifyOpts } = options || {}
    const { secret = "mysecretkey", ...verifyOpts } = options || {};
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret, {
            ...defaults,
            ...verifyOpts
        });
        return {
            payload
        };
    }
    catch (error) {
        return {
            error: error.message
        };
    }
};
exports.verifyToken = verifyToken;
