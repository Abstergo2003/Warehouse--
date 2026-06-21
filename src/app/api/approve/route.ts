import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const action = searchParams.get("action");
  const secret = searchParams.get("secret");

  const configuredSecret = process.env.REGISTRATION_SECRET || "default_secret_123";

  if (!email || !action || !secret) {
    return new NextResponse("Missing required parameters: email, action, and secret are required.", { status: 400 });
  }

  if (secret !== configuredSecret) {
    return new NextResponse("Unauthorized: Invalid secret token.", { status: 403 });
  }

  if (action !== "approve" && action !== "block") {
    return new NextResponse("Invalid action: Must be 'approve' or 'block'.", { status: 400 });
  }

  try {
    const status = action === "approve" ? "approved" : "blocked";
    
    // Check if the user exists
    const user = (await sql`SELECT id FROM users WHERE email = ${email}`)[0];
    if (!user) {
      return new NextResponse(`User with email ${email} not found. Make sure they have attempted to sign in first.`, { status: 404 });
    }

    // Update status
    await sql`
      UPDATE users 
      SET status = ${status} 
      WHERE email = ${email}
    `;

    const baseUrl = process.env.AUTH_URL 
      ? process.env.AUTH_URL.replace(/\/api\/auth\/?$/, '') 
      : "http://localhost:3000";

    // Return a premium styled HTML response page matching the design system
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Warehouse Access Management</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            background-color: #0f0f11;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            backdrop-filter: blur(8px);
            box-sizing: border-box;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .email {
            color: #4285F4;
            font-weight: bold;
            background: rgba(66, 133, 244, 0.1);
            padding: 6px 12px;
            border-radius: 4px;
            display: inline-block;
            margin: 15px 0;
            word-break: break-all;
          }
          .status {
            font-size: 16px;
            opacity: 0.8;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ffffff;
            color: #000000;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${action === 'approve' ? '✅' : '🚫'}</div>
          <div class="title">Action Completed</div>
          <div class="email">${email}</div>
          <div class="status">User status has been successfully set to <strong>${status.toUpperCase()}</strong>.</div>
          <a class="btn" href="${baseUrl}">Go to App</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html"
      }
    });

  } catch (error) {
    console.error("Error executing user status update:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
