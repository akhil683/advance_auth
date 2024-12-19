"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRoutes = void 0;
const express_1 = require("express");
const session_controller_1 = require("../controllers/session.controller");
exports.sessionRoutes = (0, express_1.Router)();
//prefix: /sessions
exports.sessionRoutes.get("/", session_controller_1.getSessionHandler);
exports.sessionRoutes.delete("/:id", session_controller_1.deleteSessionHandler);
