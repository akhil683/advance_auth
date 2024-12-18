import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectId | undefined | unknown;
      sessionId: mongoose.Types.ObjectId | undefined | unknown;
    }
  }
}

export { }
