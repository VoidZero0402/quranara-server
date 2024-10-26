import express from "express";

import authRouter from "@/routes/v1/auth";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);

export default app;
