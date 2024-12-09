import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import secure from "./middlewares/secure";
import parseQuery from "./middlewares/parseQuery";
import notFound from "./middlewares/notFound";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import authRouter from "@/routes/v1/auth";
import coursesRouter from "@/routes/v1/courses";
import topicsRouter from "@/routes/v1/topics";
import sessionsRouter from "@/routes/v1/sessions";
import questionsRouter from "@/routes/v1/questions";
import uploadsRouter from "@/routes/v1/uploads";
import ticketsRouter from "@/routes/v1/tickets";
import categoriesRouter from "@/routes/v1/categories";
import tvRouter from "@/routes/v1/tv";
import blogRouter from "@/routes/v1/blog";
import commentsRouter from "@/routes/v1/comments";
import discountsRouter from "@/routes/v1/discounts";
import cartRouter from "@/routes/v1/cart";
import meRouter from "@/routes/v1/me";
import ordersRouter from "@/routes/v1/orders";
import newsRouter from "@/routes/v1/news";
import uiRouter from "@/routes/v1/ui";
import pollRouter from "@/routes/v1/polls";
import notificationsRouter from "@/routes/v1/notifications";

const app = express();

// app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7" }));
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization", "x-quranara-secret"], credentials: true }));
// app.use(secure);
app.use(helmet());

app.use(async (req, res, next) => {
    await new Promise((res) => setTimeout(res, 1000));
    next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(parseQuery);

app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tv", tvRouter);
app.use("/api/blog", blogRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/discounts", discountsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/me", meRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/news", newsRouter);
app.use("/api/ui", uiRouter);
app.use("/api/poll", pollRouter);
app.use("/api/notifications", notificationsRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
