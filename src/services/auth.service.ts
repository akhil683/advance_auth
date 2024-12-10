import { JWT_REFRESH_TOKEN, JWT_SECRET } from "../constants/env";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/AppAssert";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken"
import { RefreshTokenSignOptions, signToken } from "../utils/jwt";

export type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
}

export const createAccount = async (data: createAccountParams) => {
  //verify existing user doesn't exist
  const existingUser = await UserModel.exists({
    email: data.email
  })

  //Custom app error
  appAssert(!existingUser, CONFLICT, "Email already in use")

  //create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password
  })
  const userId = user._id

  //create verification email
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  })
  // send verification email

  //create session
  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  })

  //sign access token & refresh token
  const refreshToken = signToken(
    {
      sessionId: session._id
    },
    RefreshTokenSignOptions
  )
  const accessToken = signToken({
    userId: user._id,
    sessionId: session._id
  })

  //return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken
  }
}

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
}

export const loginUser = async ({ email, password, userAgent }: LoginParams) => {
  //get the user by email
  const user = await UserModel.findOne({ email })
  appAssert(user, UNAUTHORIZED, "Invalid email or password")

  //validate password from the request
  const isValid = await user.comparePassword(password)
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password")
  const userId = user._id

  //create a session
  const session = await SessionModel.create({
    userId,
    userAgent
  })
  const sessionInfo = {
    sessionId: session._id,
  }

  //sign access token & refresh token
  const refreshToken = signToken(
    sessionInfo,
    RefreshTokenSignOptions
  )
  const accessToken = signToken({
    ...sessionInfo,
    userId: user._id,
  })

  //return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  }
}

