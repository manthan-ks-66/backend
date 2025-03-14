import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

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
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likesRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

app.get("/", (_, res) => {
  res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "Welcome to Youtube backend project",
  });
});

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
