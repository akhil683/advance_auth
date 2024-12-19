"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../constants/env");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_1.MONGO_URI);
        console.log("Successfully connect to DB");
    }
    catch (err) {
        console.log("Could not connect to DB", err);
    }
};
exports.default = connectDB;
