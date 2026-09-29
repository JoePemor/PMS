import express from "express";

import cors from "cors";

const app = express();

// basic express config
app.use(express.json({ limit: "17kb" }));
app.use(express.urlencoded({ extended: true, limit: "17kb" }));
app.use(express.static("public"));

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
import registerUserRouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck", healthCheckerRouter);
app.use("/api/v1/testmailer", testEmailSenderRouter);
app.use("/api/v1/auth", registerUserRouter);

// app.js handles builds/configs of the Express application
