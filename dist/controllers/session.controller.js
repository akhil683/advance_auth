"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessionHandler = exports.getSessionHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
exports.getSessionHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessions = await session_model_1.default.find({
        userId: req.userId, expiresAt: {
            $gt: new Date()
        },
    }, {
        _id: 1,
        userAgent: 1,
        createdAt: 1
    }, {
        sort: { createdAt: -1 },
    });
    return res.status(http_1.OK).json(sessions.map((session) => ({
        ...session.toObject(), //all sessions
        ...(session.id === req.sessionId && {
            isCurrent: true,
        }) // current session
    })));
});
exports.deleteSessionHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessionId = zod_1.z.string().parse(req.params.id);
    const deleted = await session_model_1.default.findOneAndDelete({
        _id: sessionId,
        userId: req.userId // only this user is allowed to delete his session
    });
    (0, AppAssert_1.default)(deleted, http_1.NOT_FOUND, "Session not found");
    return res.status(http_1.OK).json({
        message: "Session deleted"
    });
});
