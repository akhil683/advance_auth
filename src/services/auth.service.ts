import { APP_ORIGIN, JWT_REFRESH_TOKEN, JWT_SECRET } from "../constants/env";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/AppAssert";
import { fiveMinuteAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import jwt from "jsonwebtoken"
import { RefreshTokenPayload, RefreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";
import { sendMail } from "../utils/sendMail";
import { getPasswordResetTemplate, getVerifyEmailTemplate } from "../utils/emailTemplates";
import { hashValue } from "../utils/bcrypt";

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
  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`

  // send verification email
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url)
  })
  if (error) {
    console.log(error)
  }

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

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: RefreshTokenSignOptions.secret
  })
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token")

  const session = await SessionModel.findById(payload.sessionId)
  const now = Date.now()
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  )
  //refresh the session if it expires in the next 24 hours
  //user login at 29th day last hour and whil using our application, 
  //it suddely logouts at 30th day. To prevent that

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow()
    await session.save()
  }

  //New refreshToken with  updated expiresAt
  const newRefreshToken = sessionNeedsRefresh
    ? signToken({
      sessionId: session._id,
    },
      RefreshTokenSignOptions
    )
    : undefined

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id
  })

  return { accessToken, newRefreshToken }
}

export const verifyEmail = async (code: string) => {
  //get the verification Code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() }
  })
  appAssert(validCode, NOT_FOUND, "Invalid or expired verifcation code")

  //Update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    //update verified field
    {
      verified: true,
    },
    //Get new updated user
    { new: true }
  )
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email")

  //delete verification code
  await validCode.deleteOne()

  //return user
  return {
    user: updatedUser.omitPassword()
  }
}

export const sendPasswordResetEmail = async (email: string) => {

  //get the user by email
  const user = await UserModel.findOne({ email })
  appAssert(user, NOT_FOUND, "User not found")

  //check email rate limit.(ensure user don't spam our server)
  const fiveMinAgo = fiveMinuteAgo()
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo } // createAt > 5 min
  })
  appAssert(count <= 2, TOO_MANY_REQUESTS, "Too many requests, please try again later")

  //create verification code
  const expiresAt = oneHourFromNow()
  const verificationcode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  })

  //send verification email
  const url = `${APP_ORIGIN}/password/reset?code=${verificationcode._id}&exp=${expiresAt.getTime()}`
  const { data, error } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  })
  appAssert(data?.id, INTERNAL_SERVER_ERROR, `${error?.name} - ${error?.message}`)

  //retur success
  return {
    url,
    emailId: data.id
  }
}

type ResetPasswordParams = {
  password: string;
  verificationCode: string;
}

export const resetPassword = async ({ password, verificationCode }: ResetPasswordParams) => {

  //get the verification Code
  const validcode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() }
  })
  appAssert(validcode, NOT_FOUND, "Invalid or expired verification code")

  //update the users password
  const updatedUser = await UserModel.findByIdAndUpdate(
    validcode.userId,
    {
      password: await hashValue(password)
    }
  )
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password")

  //delete the verification code
  await validcode.deleteOne()

  //delete all sessions of user
  await SessionModel.deleteMany({
    userId: updatedUser._id
  })

  //return updated user
  return {
    user: updatedUser.omitPassword()
  }
}
