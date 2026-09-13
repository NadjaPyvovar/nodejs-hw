import createHttpError from "http-errors";

import { Session } from "../models/session.js";
import { User } from "../models/user.js";

export const authenticate = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw createHttpError(401, "Missing access token");
  }

  const session = await Session.findOne({ accessToken });

  if (!session) {
    throw createHttpError(401, "Session not found");
  }

  if (session.accessTokenValidUntil < new Date()) {
    throw createHttpError(401, "Access token expired");
  }

  const user = await User.findById(session.userId);

  if (!user) {
    throw createHttpError(401);
  }

  req.user = user;

  next();
};

// note: no try/catch needed as Express 5 automatically forwards rejected promises from async middleware/handlers to error middleware (also because of this the controller never wrap things in try/catch) => as explained in the lection
