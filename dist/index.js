"use strict";
var __importDefault = (this && this.__importDefault) || function(mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = require("./constants/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const http_1 = require("./constants/http");
const auth_route_1 = require("./routes/auth.route");
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const user_route_1 = require("./routes/user.route");
const session_route_1 = require("./routes/session.route");
const app = (0, express_1.default)();
app.use(express_1.default.json()); // allows us to parse incoming req with JSON payload : req.body
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
  origin: env_1.APP_ORIGIN,
  credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.get("/", (_, res) => {
  return res.status(http_1.OK).json({
    status: "healthy",
  });
});
//Auth Routes
app.use("/auth", auth_route_1.authRoutes);
// Protected Routes
app.use("/user", authenticate_1.default, user_route_1.userRoutes);
app.use("/sessions", authenticate_1.default, session_route_1.sessionRoutes);
//Error handler middleware
app.use(errorHandler_1.default);
app.listen(env_1.PORT, async () => {
  await (0, db_1.default)();
  console.log(`Server is running on PORT ${env_1.PORT} in ${env_1.NODE_ENV} environment`);
});
