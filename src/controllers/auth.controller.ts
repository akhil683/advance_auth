import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { createAccount, loginUser, refreshUserAccessToken, resetPassword, sendPasswordResetEmail, verifyEmail } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { z } from "zod";
import { clearAuthCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthCookies } from "../utils/cookies";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, verificationCodeSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/AppAssert";

export const registerHandler = catchErrors(
  async (req, res) => {
    //validate request
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    })

    // Call service
    const { user, accessToken, refreshToken } = await createAccount(request)

    //return response
    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json(user)
  }
)

export const loginHandler = catchErrors(
  async (req, res) => {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    })
    const { accessToken, refreshToken, user } = await loginUser(request)

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Login successfull",
      })

  })

export const logoutHandler = catchErrors(
  async (req, res) => {
    //Get the accessToken
    const accessToken = req.cookies.accessToken as string | undefined

    //Verify the token
    const { payload } = verifyToken(accessToken || "")

    //Delete the session
    if (payload) {
      await SessionModel.findByIdAndDelete(payload.sessionId)
    }

    // clear cookies
    return clearAuthCookies(res).status(OK).json({
      message: "Logout successfull"
    })
  }
)

export const refreshHandler = catchErrors(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined
    appAssert(refreshToken, UNAUTHORIZED, "Missing refreshToken")

    const { accessToken, newRefreshToken } = await refreshUserAccessToken(refreshToken)

    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions())
    }
    return res
      .status(OK)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions()).
      json({
        message: "AccessToken refreshed"
      })
  }

)

export const verifyEmailHandler = catchErrors(
  async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code)

    await verifyEmail(verificationCode)

    return res.status(OK).json({
      message: "Email was successfully verified"
    })
  }
)

export const sendPasswordResetHandler = catchErrors(
  async (req, res) => {
    const email = emailSchema.parse(req.body.email)

    await sendPasswordResetEmail(email)

    return res.status(OK).json({
      message: "Password reset email sent"
    })
  }
)

export const resetPasswordHandler = catchErrors(
  async (req, res) => {
    const request = resetPasswordSchema.parse(req.body)

    await resetPassword(request)

    return clearAuthCookies(res).status(OK).json({
      message: "Password reset successfull"
    })
  }
)
