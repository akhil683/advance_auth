"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.verifyEmail = exports.refreshUserAccessToken = exports.loginUser = exports.createAccount = void 0;
const env_1 = require("../constants/env");
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const verificationCode_model_1 = __importDefault(require("../models/verificationCode.model"));
const AppAssert_1 = __importDefault(require("../utils/AppAssert"));
const date_1 = require("../utils/date");
const jwt_1 = require("../utils/jwt");
const sendMail_1 = require("../utils/sendMail");
const emailTemplates_1 = require("../utils/emailTemplates");
const bcrypt_1 = require("../utils/bcrypt");
const createAccount = async (data) => {
    //verify existing user doesn't exist
    const existingUser = await user_model_1.default.exists({
        email: data.email
    });
    //Custom app error
    (0, AppAssert_1.default)(!existingUser, http_1.CONFLICT, "Email already in use");
    //create user
    const user = await user_model_1.default.create({
        email: data.email,
        password: data.password
    });
    const userId = user._id;
    //create verification email
    const verificationCode = await verificationCode_model_1.default.create({
        userId,
        type: "email_verifictaion" /* VerificationCodeType.EmailVerification */,
        expiresAt: (0, date_1.oneYearFromNow)(),
    });
    const url = `${env_1.APP_ORIGIN}/email/verify/${verificationCode._id}`;
    // send verification email
    const { error } = await (0, sendMail_1.sendMail)({
        to: user.email,
        ...(0, emailTemplates_1.getVerifyEmailTemplate)(url)
    });
    if (error) {
        console.log(error);
    }
    //create session
    const session = await session_model_1.default.create({
        userId,
        userAgent: data.userAgent,
    });
    //sign access token & refresh token
    const refreshToken = (0, jwt_1.signToken)({
        sessionId: session._id
    }, jwt_1.RefreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        userId: user._id,
        sessionId: session._id
    });
    //return user & tokens
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent }) => {
    //get the user by email
    const user = await user_model_1.default.findOne({ email });
    (0, AppAssert_1.default)(user, http_1.UNAUTHORIZED, "Invalid email or password");
    //validate password from the request
    const isValid = await user.comparePassword(password);
    (0, AppAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid email or password");
    const userId = user._id;
    //create a session
    const session = await session_model_1.default.create({
        userId,
        userAgent
    });
    const sessionInfo = {
        sessionId: session._id,
    };
    //sign access token & refresh token
    const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.RefreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        ...sessionInfo,
        userId: user._id,
    });
    //return user & tokens
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const refreshUserAccessToken = async (refreshToken) => {
    const { payload } = (0, jwt_1.verifyToken)(refreshToken, {
        secret: jwt_1.RefreshTokenSignOptions.secret
    });
    (0, AppAssert_1.default)(payload, http_1.UNAUTHORIZED, "Invalid refresh token");
    const session = await session_model_1.default.findById(payload.sessionId);
    const now = Date.now();
    (0, AppAssert_1.default)(session && session.expiresAt.getTime() > now, http_1.UNAUTHORIZED, "Session expired");
    //refresh the session if it expires in the next 24 hours
    //user login at 29th day last hour and whil using our application, 
    //it suddely logouts at 30th day. To prevent that
    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= date_1.ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = (0, date_1.thirtyDaysFromNow)();
        await session.save();
    }
    //New refreshToken with  updated expiresAt
    const newRefreshToken = sessionNeedsRefresh
        ? (0, jwt_1.signToken)({
            sessionId: session._id,
        }, jwt_1.RefreshTokenSignOptions)
        : undefined;
    const accessToken = (0, jwt_1.signToken)({
        userId: session.userId,
        sessionId: session._id
    });
    return { accessToken, newRefreshToken };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
const verifyEmail = async (code) => {
    //get the verification Code
    const validCode = await verificationCode_model_1.default.findOne({
        _id: code,
        type: "email_verifictaion" /* VerificationCodeType.EmailVerification */,
        expiresAt: { $gt: new Date() }
    });
    (0, AppAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid or expired verifcation code");
    //Update user to verified true
    const updatedUser = await user_model_1.default.findByIdAndUpdate(validCode.userId, 
    //update verified field
    {
        verified: true,
    }, 
    //Get new updated user
    { new: true });
    (0, AppAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
    //delete verification code
    await validCode.deleteOne();
    //return user
    return {
        user: updatedUser.omitPassword()
    };
};
exports.verifyEmail = verifyEmail;
const sendPasswordResetEmail = async (email) => {
    //get the user by email
    const user = await user_model_1.default.findOne({ email });
    (0, AppAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
    //check email rate limit.(ensure user don't spam our server)
    const fiveMinAgo = (0, date_1.fiveMinuteAgo)();
    const count = await verificationCode_model_1.default.countDocuments({
        userId: user._id,
        type: "password_reset" /* VerificationCodeType.PasswordReset */,
        createdAt: { $gt: fiveMinAgo } // createAt > 5 min
    });
    (0, AppAssert_1.default)(count <= 2, http_1.TOO_MANY_REQUESTS, "Too many requests, please try again later");
    //create verification code
    const expiresAt = (0, date_1.oneHourFromNow)();
    const verificationcode = await verificationCode_model_1.default.create({
        userId: user._id,
        type: "password_reset" /* VerificationCodeType.PasswordReset */,
        expiresAt,
    });
    //send verification email
    const url = `${env_1.APP_ORIGIN}/password/reset?code=${verificationcode._id}&exp=${expiresAt.getTime()}`;
    const { data, error } = await (0, sendMail_1.sendMail)({
        to: user.email,
        ...(0, emailTemplates_1.getPasswordResetTemplate)(url),
    });
    (0, AppAssert_1.default)(data?.id, http_1.INTERNAL_SERVER_ERROR, `${error?.name} - ${error?.message}`);
    //retur success
    return {
        url,
        emailId: data.id
    };
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const resetPassword = async ({ password, verificationCode }) => {
    //get the verification Code
    const validcode = await verificationCode_model_1.default.findOne({
        _id: verificationCode,
        type: "password_reset" /* VerificationCodeType.PasswordReset */,
        expiresAt: { $gt: new Date() }
    });
    (0, AppAssert_1.default)(validcode, http_1.NOT_FOUND, "Invalid or expired verification code");
    //update the users password
    const updatedUser = await user_model_1.default.findByIdAndUpdate(validcode.userId, {
        password: await (0, bcrypt_1.hashValue)(password)
    });
    (0, AppAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to reset password");
    //delete the verification code
    await validcode.deleteOne();
    //delete all sessions of user
    await session_model_1.default.deleteMany({
        userId: updatedUser._id
    });
    //return updated user
    return {
        user: updatedUser.omitPassword()
    };
};
exports.resetPassword = resetPassword;
