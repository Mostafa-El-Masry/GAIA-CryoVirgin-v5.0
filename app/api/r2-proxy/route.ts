import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Get environment variables
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_S3_ENDPOINT || "";
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || "";

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Missing key parameter" },
      { status: 400 },
    );
  }

  // Check if R2 is configured
  if (!R2_ENDPOINT || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    // Return a placeholder image if R2 is not configured
    return new NextResponse(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
          Image not available
        </text>
        <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
          ${key}
        </text>
      </svg>`,
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    // Convert the stream to a Response
    const stream = response.Body as any;
    const headers = new Headers();

    if (response.ContentType) {
      headers.set("Content-Type", response.ContentType);
    }
    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }
    if (response.ETag) {
      headers.set("ETag", response.ETag);
    }
    if (response.LastModified) {
      headers.set("Last-Modified", response.LastModified.toISOString());
    }

    headers.set("Cache-Control", "public, max-age=31536000"); // 1 year

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("R2 proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch object" },
      { status: 500 },
    );
  }
}
