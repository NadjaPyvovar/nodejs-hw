// Node built-ins
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// third-party packages
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

// local modules
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

// constants / setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resetPasswordTemplate = handlebars.compile(
  fs.readFileSync(
    path.join(__dirname, '../templates/reset-password-email.html'),
    'utf-8',
  ),
);

// controllers

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.status(201).json(user);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.status(200).json(user);
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: sessionId });

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({ _id: sessionId });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${encodeURIComponent(token)}`;

  const html = resetPasswordTemplate({
    username: user.username,
    resetLink,
  });

  try {
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully',
  });
};

// notes: registerUser => rejects duplicate emails, then hashed with bcrypt.hash(password, 10) (where 10 salt rounds in standard default), then creates the session/cookies; loginUser returning "Invalid credentials" whether the email does not exist or password is wrong; refreshUserSession => validating the session by both sessionId & refreshToken; logoutUser: res.clearCookie(name) => sends a Set-Cookie header with the same name but an expiry in the past, i.e. telling the browser to delete it (i.e. 204 = "success, no content")
// inside the expired-token session, before throwing error, to delete the stale session from the database and clear all three cookies on the response, so the client isn't left with cookies pointing to a session no longer working, only hereafter throwing createHttpError(...) triggering errorHandler & returning 401 status, as res.clearCookie(...) queues Set-Cookie headers (i.e. it does not send the response, thus the subsequent throw still reachers error middleware)
// when the user ist't found, requestResetEmail still returns 200 status, preventing leaking which emails are registered; jwt.sing(payload, secret, options) embeds sub (i.e. subject = the user id) and email into a signed token expiring in 15 min; so no one can forge or extend the token without knowing JWT_SECRET; jwt.verify(token, secret) throws if the token is malformed, tampered with or expired => c401 Invalid or expired token status; payload.sub & payload.email: looking the user up by both
