import { RequestHandler } from "express";
import appAssert from "../utils/AppAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { verifyToken } from "../utils/jwt";

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not Authorized",
    AppErrorCode.InvalidAccessToken
  )

  //If user had a cookie
  const { error, payload } = verifyToken(accessToken)
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid Token",
    AppErrorCode.InvalidAccessToken
  )

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next()
}

export default authenticate
