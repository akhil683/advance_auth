"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// re_LaMzkwCt_56jfJr8xYEWnip4EQ14aX7tU
const env_1 = require("../constants/env");
const resend_1 = require("resend");
const resend = new resend_1.Resend(env_1.RESEND_API_KEY);
exports.default = resend;
