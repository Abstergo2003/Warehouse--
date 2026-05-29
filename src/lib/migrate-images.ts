import db from "./db";

async function migrate() {
  console.log("Starting S3 URL migration in database...");
  try {
    // Convert http://localhost:9000/bucket/filename to /api/images/filename
    const itemsResult = await db`
      UPDATE item 
      SET image_url = '/api/images/' || SUBSTRING(image_url FROM '[^/]+$') 
      WHERE image_url LIKE 'http%' 
      RETURNING id, image_url;
    `;
    console.log(`Migrated ${itemsResult.length} item images.`);

    const storagesResult = await db`
      UPDATE storage 
      SET img_url = '/api/images/' || SUBSTRING(img_url FROM '[^/]+$') 
      WHERE img_url LIKE 'http%' 
      RETURNING id, img_url;
    `;
    console.log(`Migrated ${storagesResult.length} warehouse banner images.`);
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
