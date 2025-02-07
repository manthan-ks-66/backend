import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// middlewares
app.use(express.json({ limit: "50kb" }));
// encode the url that has symbols and special charecters like %_ @#
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vidoes", videoRouter);

export { app };
