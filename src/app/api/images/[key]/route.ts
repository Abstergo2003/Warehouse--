import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { key } = await params;

  try {
    // 1. Authorization check: Check if the user has access to the item associated with this image key
    const itemAccess = await db`
      SELECT 1 FROM item i
      WHERE i.image_url LIKE '%' || ${key}
      AND (
        i.owner_id = ${userId}
        OR i.storage_id IN (
          SELECT id FROM storage WHERE owner_id = ${userId}
          UNION
          SELECT storage_id FROM user_storage WHERE user_id = ${userId}
        )
      );
    `;

    // 2. Authorization check: Check if the image belongs to a warehouse they have access to
    const storageAccess = await db`
      SELECT 1 FROM storage s
      LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${userId}
      WHERE s.img_url LIKE '%' || ${key}
      AND (
        s.owner_id = ${userId}
        OR us.user_id IS NOT NULL
      );
    `;

    // If the user has no rights to view either the item or warehouse matching the key, return 403
    if (itemAccess.length === 0 && storageAccess.length === 0) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Fetch image from private S3 bucket
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const s3Response = await s3.send(command);

    if (!s3Response.Body) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Set response headers and return body stream
    const contentType = s3Response.ContentType || "application/octet-stream";
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Cache-Control", "private, max-age=3600"); // Cache privately in browser for 1 hour

    // Convert S3 Body stream to Web ReadableStream
    const stream = s3Response.Body.transformToWebStream();

    return new NextResponse(stream, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error serving image through proxy:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
