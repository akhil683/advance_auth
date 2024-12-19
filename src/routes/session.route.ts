import { Router } from "express";
import { deleteSessionHandler, getSessionHandler } from "../controllers/session.controller";

export const sessionRoutes = Router()

//prefix: /sessions

sessionRoutes.get("/", getSessionHandler)
sessionRoutes.delete("/:id", deleteSessionHandler)
