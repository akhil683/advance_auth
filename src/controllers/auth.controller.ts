import { CREATED, OK } from "../constants/http";
import { createAccount, loginUser } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { z } from "zod";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";

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
    const accessToken = req.cookies.accessToken

    //Verify the token
    const { payload } = verifyToken(accessToken)

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
