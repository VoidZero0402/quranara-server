import { NextFunction, Request, Response } from "express";

export const signup = async (req: Request, res: Response, next: NextFunction) => {};
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {};
export const loginWithOtp = async (req: Request, res: Response, next: NextFunction) => {};
export const loginWithEmail = async (req: Request, res: Response, next: NextFunction) => {};
export const getMe = async (req: Request, res: Response, next: NextFunction) => {};
export const logout = async (req: Request, res: Response, next: NextFunction) => {};
