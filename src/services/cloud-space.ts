import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ServiceUnavailableException } from "@/utils/exceptions";

const s3 = new S3Client({
    region: "default",
    endpoint: process.env.AWS_END_POINT_URL,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
    },
});

export const generatePreSignedUrl = async (key: string, type: string, path?: string): Promise<string> => {
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: path ? `${path}/${key}` : key,
        ContentType: type,
    };

    try {
        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 300 });
        return url;
    } catch {
        throw new ServiceUnavailableException("cloud space service in unavailable");
    }
};
