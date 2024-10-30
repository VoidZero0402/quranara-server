import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import globalErrorHandler from "./middlewares/globalErrorHandler";

import authRouter from "@/routes/v1/auth";
import coursesRouter from "@/routes/v1/courses";
import topicsRouter from "@/routes/v1/topics";
import sessionsRouter from "@/routes/v1/sessions";
import questionsRouter from "@/routes/v1/questions";
import uploadsRouter from "@/routes/v1/uploads";
import ticketsRouter from "@/routes/v1/tickets";

const app = express();

// ! only for dev
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/tickets", ticketsRouter);

app.use(globalErrorHandler);

export default app;
