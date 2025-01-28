import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import cors from "./middlewares/cors";
import secure from "./middlewares/secure";
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
import usersRouter from "@/routes/v1/users";
import pollRouter from "@/routes/v1/polls";
import notificationsRouter from "@/routes/v1/notifications";

const app = express();

app.set("trust proxy", true);

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-7", validate: { trustProxy: false } }));
app.use(cors);
app.use(secure);
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(process.env.COOKIES_SECRET));

app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/topics", topicsRouter);
app.use("/sessions", sessionsRouter);
app.use("/questions", questionsRouter);
app.use("/uploads", uploadsRouter);
app.use("/tickets", ticketsRouter);
app.use("/categories", categoriesRouter);
app.use("/tv", tvRouter);
app.use("/blog", blogRouter);
app.use("/comments", commentsRouter);
app.use("/discounts", discountsRouter);
app.use("/cart", cartRouter);
app.use("/me", meRouter);
app.use("/orders", ordersRouter);
app.use("/news", newsRouter);
app.use("/ui", uiRouter);
app.use("/users", usersRouter);
app.use("/poll", pollRouter);
app.use("/notifications", notificationsRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
