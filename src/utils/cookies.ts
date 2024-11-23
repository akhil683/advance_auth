import { Response, CookieOptions } from "express"
import { fifteenDaysFromNow, thirtyDaysFromNow } from "./date"

const secure = process.env.NODE_ENV !== "development"

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
}

const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenDaysFromNow(),
})

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "/auth/refresh"
})

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
}
