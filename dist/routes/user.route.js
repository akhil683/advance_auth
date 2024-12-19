"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
exports.userRoutes = (0, express_1.Router)();
//prefix: /user
exports.userRoutes.get("/", user_controller_1.getUserHandler);
