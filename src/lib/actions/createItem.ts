'use server'

import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { createItemQuery, editItemQuery } from "./queries";
import { auth } from "@/lib/auth";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function createItemAction(formData: FormData) {
  const session = await auth();
  const file = formData.get("image") as File;
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const storage_id = formData.get("storage_id") as string;
  const unit = formData.get("unit") as string;
  const ownerId = session?.user?.id || "";
  let dbImageUrl = null;
  const rawData = JSON.parse(formData.get("data") as string);
  const formatData = []
  for (const item of rawData) {
    formatData.push({name: item.name, fields: item.fields});
  }
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
      throw new Error(`Nie udało się wgrać zdjęcia: ${error}`);
    }
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryResult = await createItemQuery(name, amount, unit, dbImageUrl || "", storage_id, ownerId, JSON.stringify(formatData));
  revalidatePath("/");
}

export async function editItemAction(formData: FormData) {
  const session = await auth();
  const file = formData.get("image") as File;
  const item_id = formData.get("item_id") as string;
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const storage_id = formData.get("storage_id") as string;
  const unit = formData.get("unit") as string;
  const is_damaged = formData.get("is_damaged") === "true";
  const min_amount = parseFloat(formData.get("min_amount") as string) || 0;
  const ownerId = session?.user?.id || "";
  let dbImageUrl = null;
  
  const rawData = JSON.parse(formData.get("data") as string);
  const formatData = [];
  for (const item of rawData) {
    formatData.push({ name: item.name, fields: item.fields });
  }

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
      throw new Error(`Nie udało się wgrać zdjęcia: ${error}`);
    }
  }

  const success = await editItemQuery(
    name,
    amount,
    unit,
    storage_id,
    ownerId,
    JSON.stringify(formatData),
    item_id,
    is_damaged,
    min_amount,
    dbImageUrl
  );

  revalidatePath("/");
  revalidatePath(`/items/${item_id}`);
  return success;
}