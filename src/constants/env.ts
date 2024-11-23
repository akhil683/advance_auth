// const getEnv = (key: string, defaultValue?: string): string => {
//   const value = process.env[key] || defaultValue
//
//   if (value === undefined) {
//     throw new Error(`Missing environment variable for ${key}`)
//   }
//   return value
// }

export const PORT = process.env.PORT!
export const MONGO_URI = process.env.MONGO_URI!
export const NODE_ENV = process.env.NODE_ENV!
export const APP_ORIGIN = process.env.APP_ORIGIN!
export const JWT_SECRET = process.env.JWT_SECRET!
export const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN!
// export const EMAIL_SENDER = getEnv("EMAIL_SENDER")
// export const RESEND_API_KEY = getEnv("RESEND_API_KEY")
//
