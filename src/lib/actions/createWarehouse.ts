'use server'

import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { createStorageQuery, deleteStorageQuery, editStorageQuery } from "./queries";

const s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
});

export async function CreateWarehouseAction(formData: FormData) {
    const session = await auth();
    const name = formData.get("name") as string;
    const area = formData.get("area") as string;
    const coords = formData.get("coords") as string;
    const file = formData.get("image") as File;
    const ownerId = session?.user?.id || "";
    let dbImageUrl = null;

    if (file && file.size > 0) {
        const uniqueFileName = `${randomUUID()}-${file.name.replace(/\s/g, '-')}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        try {
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: file.type,
            }));
            const host = process.env.NEXT_PUBLIC_S3_HOSTNAME || "localhost";
            const port = process.env.NEXT_PUBLIC_S3_PORT || "9000";
            const bucket = process.env.S3_BUCKET_NAME!;
            dbImageUrl = `http://${host}:${port}/${bucket}/${uniqueFileName}`;
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }
    await createStorageQuery(name, ownerId, coords, +area, dbImageUrl || "");
    revalidatePath("/");
    revalidatePath("/locations");
}

export async function UpdateWarehouseAction(formData: FormData, storageId: string) {
    const session = await auth();
    const name = formData.get("name") as string;
    const area = formData.get("area") as string;
    const coords = formData.get("coords") as string;
    const file = formData.get("image") as File;
    const ownerId = session?.user?.id || "";
    let dbImageUrl = null;

    if (file && file.size > 0) {
        const uniqueFileName = `${randomUUID()}-${file.name.replace(/\s/g, '-')}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        try {
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: file.type,
            }));
            const host = process.env.NEXT_PUBLIC_S3_HOSTNAME || "localhost";
            const port = process.env.NEXT_PUBLIC_S3_PORT || "9000";
            const bucket = process.env.S3_BUCKET_NAME!;
            dbImageUrl = `http://${host}:${port}/${bucket}/${uniqueFileName}`;
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }
    
    await editStorageQuery(name, coords, +area, dbImageUrl, storageId, ownerId);
    revalidatePath("/");
    revalidatePath(`/locations/${storageId}`);
}

export async function DeleteWarehouseAction(storageId: string) {
    const session = await auth();
    if (!session?.user?.id) return false;
    const result = await deleteStorageQuery(storageId, session.user.id);
    if (result) {
        revalidatePath("/");
        revalidatePath("/locations");
    }
    return result;
}