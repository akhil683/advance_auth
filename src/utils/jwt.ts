import jwt, { SignOptions } from "jsonwebtoken"
import { SessionDocument } from "../models/session.model"
import { UserDocument } from "../models/user.model"
import { JWT_SECRET, JWT_REFRESH_TOKEN } from "../constants/env"

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"]
}
export type AccessTokenPayload = {
  userId: UserDocument["_id"],
  sessionId: SessionDocument["_id"]
}
type SignOptionsAndSecret = SignOptions & {
  secret: string
}
const defaults: SignOptions = {
  audience: ['user'],
}
const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  // TODO: secret: JWT_SECRET
  secret: "mysecretkey",
}
export const RefreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  // TODO: secret: JWT_REFRESH_TOKEN
  secret: "myjwtrefreshsecret"
}

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOpts } = options || accessTokenSignOptions
  return jwt.sign(payload, secret, {
    ...defaults,
    ...signOpts
  })
}
