import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// basic express config
app.use(express.json({ limit: "17kb" }));
app.use(express.urlencoded({ extended: true, limit: "17kb" }));
app.use(express.static("public"));
app.use(cookieParser())

// cors config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.get("/", (req, res) => {
  res.send("hello express");
});

export default app;

// importing route to application config
import healthCheckerRouter from "./routes/healthcheck.routes.js";
import testEmailSenderRouter from "./routes/test.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

app.use("/api/v1/healthcheck", healthCheckerRouter);
app.use("/api/v1/testmailer", testEmailSenderRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);

// app.js handles builds/configs of the Express application
