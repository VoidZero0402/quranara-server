import { NextFunction, Request, Response } from "express";

export const getUnseenNotifications = async (req: Request, res: Response, next: NextFunction) => {};
export const getSeenNotifications = async (req: Request, res: Response, next: NextFunction) => {};
export const getNotificationsCount = async (req: Request, res: Response, next: NextFunction) => {};
export const seen = async (req: Request, res: Response, next: NextFunction) => {};
export const getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {};
export const sendAll = async (req: Request, res: Response, next: NextFunction) => {};
export const sendCourseRegisters = async (req: Request, res: Response, next: NextFunction) => {};
export const sendOne = async (req: Request, res: Response, next: NextFunction) => {};
export const update = async (req: Request, res: Response, next: NextFunction) => {};
export const remove = async (req: Request, res: Response, next: NextFunction) => {};
