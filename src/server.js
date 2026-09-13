import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(logger);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true, // reflect whatever Origin sent the request
    credentials: true, // allow cookies to be sent/received cross-origin
  }),
);

app.use(authRoutes);
app.use(notesRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Node.js HW API is running",
  });
});

app.use(errors()); // celebrate error handler middleware
app.use(notFoundHandler);
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// notes: cookieParser() middleware populates req.cookies; cors() needs credentials: true (otherwise the browser won't let cookies to flow cross-origin); origin: true reflects which origin made the request (required as CORS forbids origin: "*" when credentials: true is set) 
