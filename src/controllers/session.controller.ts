import { z } from "zod";
import { NOT_FOUND, OK } from "../constants/http";
import SessionModel from "../models/session.model";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/AppAssert";

export const getSessionHandler = catchErrors(
  async (req, res) => {
    const sessions = await SessionModel.find(
      {
        userId: req.userId, expiresAt: {
          $gt: new Date()
        },
      },
      {
        _id: 1,
        userAgent: 1,
        createdAt: 1
      },
      {
        sort: { createdAt: -1 },
      }
    )
    return res.status(OK).json(
      sessions.map((session) => ({
        ...session.toObject(), //all sessions
        ...(
          session.id === req.sessionId && {
            isCurrent: true,
          }
        )// current session
      }))
    )
  })

export const deleteSessionHandler = catchErrors(
  async (req, res) => {
    const sessionId = z.string().parse(req.params.id)

    const deleted = await SessionModel.findOneAndDelete({
      _id: sessionId,
      userId: req.userId // only this user is allowed to delete his session
    })
    appAssert(deleted, NOT_FOUND, "Session not found")

    return res.status(OK).json({
      message: "Session deleted"
    })
  }
)
