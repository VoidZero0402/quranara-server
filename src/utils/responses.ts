import { Response } from "express";

export const SuccessResponse = (res: Response, statusCode: number, data: object = {}) => res.status(statusCode).json({ success: true, status: statusCode, data });

export const ErrorResponse = (res: Response, statusCode: number, message: string, data: object = {}) => res.status(statusCode).json({ status: statusCode, success: false, error: message, data });
