import cron from "node-cron";
import { Model } from "mongoose";

import redis from "./redis";

import TicketModel from "@/models/Ticket";
import QuestionModel from "@/models/Question";
import BlogModel from "@/models/Blog";
import TvModel from "@/models/Tv";
import NotificationUserModel from "@/models/NotificationUser";

import { STATUS as TICKET_STATUS } from "@/constants/tickets";
import { STATUS as QUESTION_STATUS } from "@/constants/questions";

import { scanRedisKeys } from "@/utils/funcs";

const updateTicketsStatus = async (date: Date) => {
    await TicketModel.updateMany(
        { status: TICKET_STATUS.SLEEP, updatedAt: { $lte: date } },
        {
            $set: { status: TICKET_STATUS.COLSED },
        }
    );
};

const updateQuestionsStatus = async (date: Date) => {
    await QuestionModel.updateMany(
        { status: QUESTION_STATUS.SLEEP, updatedAt: { $lte: date } },
        {
            $set: { status: QUESTION_STATUS.COLSED },
        }
    );
};

const cleanUpNotifications = async (date: Date) => {
    await NotificationUserModel.deleteMany({ isSeen: true, updatedAt: { $lte: date } });
};

const saveViewsIntoMongoDB = async (entity: string, Model: Model<any>): Promise<void> => {
    const pattern = `${entity}:*:views`;
    const keys = await scanRedisKeys(pattern);
    const values = await redis.mget(keys);

    const cleanUp = new Map<string, string>(keys.map((key) => [key as string, "0"]));

    await redis.mset(cleanUp);

    const updates = keys.map((key, index) => {
        const _id = key.split(":")[1];

        return {
            updateOne: {
                filter: { _id },
                update: { $inc: { views: parseInt(values[index] as string) } },
            },
        };
    });

    await Model.bulkWrite(updates);
};

cron.schedule("0 0 * * *", async () => {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        await updateTicketsStatus(threeDaysAgo);

        await updateQuestionsStatus(threeDaysAgo);

        await cleanUpNotifications(sevenDaysAgo);

        await saveViewsIntoMongoDB("blog", BlogModel);

        await saveViewsIntoMongoDB("tv", TvModel);
    } catch (err) {
        console.log("Cron Job Error ->", err);
    }
});
