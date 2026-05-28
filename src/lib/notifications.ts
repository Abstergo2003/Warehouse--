import webpush from "web-push";
import db from "./db";

// Configure VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID details are not fully configured in environment variables. Web push notifications will be disabled.");
}

/**
 * Sends a web push notification to a specific user's registered browser subscriptions.
 */
export async function sendPushNotification(userId: string, title: string, body: string, url: string = "/maintenance") {
  // Fetch active subscriptions for this user
  const subscriptions = await db`
    SELECT endpoint, p256dh, auth 
    FROM push_subscriptions 
    WHERE user_id = ${userId}
  `;

  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url });

  const promises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
    } catch (error: any) {
      // If subscription expired or is gone, remove it from the DB
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`Removing expired subscription: ${sub.endpoint}`);
        await db`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
      } else {
        console.error("Error sending push notification:", error);
      }
    }
  });

  await Promise.all(promises);
}

/**
 * Saves a notification to the database for all users sharing access to a storage,
 * and broadcasts a Web Push notification to them.
 */
export async function sendNotificationToStorageUsers(
  storageId: string,
  title: string,
  body: string,
  url: string = "/maintenance",
  excludeUserId?: string
) {
  // Find all users who have access to this storage
  // (Owner of the storage or shared in user_storage)
  const usersResult = await db`
    SELECT owner_id AS user_id FROM storage WHERE id = ${storageId}
    UNION
    SELECT user_id FROM user_storage WHERE storage_id = ${storageId}
  `;

  const userIds = usersResult
    .map((r) => r.user_id)
    .filter((id) => id && id !== excludeUserId);

  if (userIds.length === 0) return;

  // 1. Save notification in database for each user
  const dbPromises = userIds.map(async (userId) => {
    try {
      await db`
        INSERT INTO notifications (user_id, title, body, url)
        VALUES (${userId}, ${title}, ${body}, ${url})
      `;
    } catch (error) {
      console.error(`Failed to save notification in DB for user ${userId}:`, error);
    }
  });

  await Promise.all(dbPromises);

  // 2. Trigger web push notification for each user
  const pushPromises = userIds.map((userId) => sendPushNotification(userId, title, body, url));
  await Promise.all(pushPromises);
}

/**
 * Compares an item's old and new state to detect transitions in maintenance status,
 * triggering appropriate notifications.
 */
export async function checkAndTriggerItemMaintenanceNotification(
  oldItem: any,
  newItem: any,
  updaterId: string
) {
  const name = newItem.name || oldItem.name;
  const storageId = newItem.storage_id || oldItem.storage_id;
  const url = `/items/${newItem.id || oldItem.id}`;

  if (!storageId) return;

  // Helper to determine if an item is considered "damaged"
  const wasDamaged = !!oldItem.is_damaged;
  const isDamaged = !!newItem.is_damaged;

  // Helper to determine if an item is below low stock
  const wasLowStock = oldItem.amount <= oldItem.min_amount;
  const isLowStock = newItem.amount <= newItem.min_amount;

  // Transition 1: Damaged status changes
  if (!wasDamaged && isDamaged) {
    await sendNotificationToStorageUsers(
      storageId,
      "Asset Damaged ⚠️",
      `"${name}" has been marked as damaged and requires attention.`,
      url,
      updaterId
    );
  } else if (wasDamaged && !isDamaged) {
    await sendNotificationToStorageUsers(
      storageId,
      "Asset Restored ✅",
      `"${name}" has been marked as repaired/functional.`,
      url,
      updaterId
    );
  }

  // Transition 2: Stock status changes
  if (!wasLowStock && isLowStock) {
    await sendNotificationToStorageUsers(
      storageId,
      "Low Stock Alert 📦",
      `"${name}" has dropped below the minimum stock level (${newItem.amount} remaining).`,
      url,
      updaterId
    );
  } else if (wasLowStock && !isLowStock) {
    await sendNotificationToStorageUsers(
      storageId,
      "Stock Replenished 📥",
      `"${name}" has been restocked (${newItem.amount} available).`,
      url,
      updaterId
    );
  }
}
