// src/lib/s3Uploader.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadImageToS3(fileBuffer: Buffer, fileType: string): Promise<string> {
    const fileExtension = fileType.split("/")[1];
    const fileName = `avatars/${uuidv4()}.${fileExtension}`;

    // 👇 Chequeamos la misma variable que luego usamos
    if (!process.env.AWS_S3_BUCKET) {
        throw new Error("❌ AWS_S3_BUCKET no está definido");
    }

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,   // 👈 coincide con tu .env
            Key: fileName,
            Body: fileBuffer,
            ContentType: fileType,
        })
    );

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}
