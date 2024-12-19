"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_DAY_MS = exports.oneHourFromNow = exports.fifteenDaysFromNow = exports.fiveMinuteAgo = exports.thirtyDaysFromNow = exports.oneYearFromNow = void 0;
const oneYearFromNow = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 // One Year
);
exports.oneYearFromNow = oneYearFromNow;
const thirtyDaysFromNow = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
exports.thirtyDaysFromNow = thirtyDaysFromNow;
const fiveMinuteAgo = () => new Date(Date.now() - 5 * 6 * 1000);
exports.fiveMinuteAgo = fiveMinuteAgo;
const fifteenDaysFromNow = () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
exports.fifteenDaysFromNow = fifteenDaysFromNow;
const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);
exports.oneHourFromNow = oneHourFromNow;
exports.ONE_DAY_MS = 24 * 60 * 60 * 1000;
