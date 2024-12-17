import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";

const handleError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map(err => ({
    path: err.path.join("."),
    message: err.message
  }))
  return res.status(BAD_REQUEST).json({
    message: error.message,
    errors
  })
}

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    messgae: error.message,
    errorCode: error.errorCode,
  })
}

const errorHandler: ErrorRequestHandler = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  console.log(`PATH: ${req.path}`, error)

  //Clear auth cookie when any error occur in this path
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res)
  }
  if (error instanceof z.ZodError) {
    return handleError(res, error)
  }
  if (error instanceof AppError) {
    return handleAppError(res, error)
  }


  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error")
}

export default errorHandler
