import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import authRouter from "@/routes/v1/auth";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);

app.use(globalErrorHandler)

export default app;
