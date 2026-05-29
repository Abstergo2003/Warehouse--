"use server"
import { Storage, TemplatesRow } from '@/lib/types';
import { revalidatePath } from "next/cache";

// STORAGE
import db from '@/lib/db'
import { checkAndTriggerItemMaintenanceNotification, sendNotificationToStorageUsers } from '@/lib/notifications'


export async function createStorageQuery(name: string, user_id: string, localization: string, storage_area: number, img_url: string) {
    if (user_id == "") {return false;}
    const result = await db`INSERT INTO storage (name, owner_id, localization, storage_area, img_url) VALUES (${name}, ${user_id}, ${localization}, ${storage_area}, ${img_url}) RETURNING *;`;
    return result.length !== 0;
}

export async function listAvailibleStoragesQuery(user_id: string) {
    if (user_id == "") {return false;}
    const result = await db`SELECT s.*, COALESCE(us.role, CASE WHEN s.owner_id = ${user_id} THEN 'owner' END) as effective_role FROM storage s LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id} WHERE s.owner_id = ${user_id} OR us.user_id IS NOT NULL;`;
    return result as unknown as Storage[];
}

export async function getStorageInfoQuery(storage_id: string, user_id: string) {
    if (user_id == "" || !storage_id) return null;
    const result = await db`
        SELECT s.*, COALESCE(us.role, CASE WHEN s.owner_id = ${user_id} THEN 'owner' END) as effective_role 
        FROM storage s 
        LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id} 
        WHERE s.id = ${storage_id} 
        AND (s.owner_id = ${user_id} OR us.user_id IS NOT NULL);
    `;
    return result[0] || null;
}

export async function editStorageQuery(name: string, localization: string, storage_area: number, img_url: string | null, id: string, user_id: string) {
    if (user_id == "") {return false;}
    const result = await db`
        UPDATE storage 
        SET name = ${name}, 
            localization = ${localization}, 
            storage_area = ${storage_area},
            img_url = COALESCE(${img_url}, img_url)
        WHERE id = ${id} AND owner_id = ${user_id}
        RETURNING *;
    `;
    return result.length !== 0;
}

export async function deleteStorageQuery(id: string, user_id: string) {
    if (user_id == "") {return false;}
    return await db.begin(async sql => {
        // Confirm ownership of the storage before deleting it or its items
        const storageCheck = await sql`SELECT 1 FROM storage WHERE id = ${id} AND owner_id = ${user_id};`;
        if (storageCheck.length === 0) {
            return false;
        }
        // Cascade delete items in the storage first to avoid foreign key constraint violations
        await sql`DELETE FROM item WHERE storage_id = ${id};`;
        // Delete the storage location itself
        const result = await sql`DELETE FROM storage WHERE id = ${id} AND owner_id = ${user_id};`;
        return result.length !== 0;
    });
}


// ITEM
export async function createItemQuery(name: string, amount: number, unit_of_measurement: string, image_url:string, storage_id: string, user_id: string, data: string) {
    if (user_id == "") {return false;}
    const result = await db`
    INSERT INTO item (name, amount, unit_of_measurement, owner_id, storage_id, image_url, data)
    SELECT ${name}, ${amount}, ${unit_of_measurement}, ${user_id}, ${storage_id}, ${image_url}, ${JSON.parse(data)}
    WHERE EXISTS (
      SELECT 1 FROM storage s
      LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id}
      WHERE s.id = ${storage_id} 
      AND (s.owner_id = ${user_id} OR us.role = 'admin')
    )
    RETURNING *;
  `;
    return result.length !== 0;
}

export async function getItemInfoQuery(user_id: string, item_id: string) {
    if (user_id == "") {return {}}
    const result = await db`
        SELECT i.*, s.name as storage_name 
        FROM item i
        LEFT JOIN storage s ON i.storage_id = s.id
        LEFT JOIN user_storage us ON i.storage_id = us.storage_id AND us.user_id = ${user_id}
        WHERE i.id = ${item_id} 
        AND (i.owner_id = ${user_id} OR us.user_id IS NOT NULL)
    `;
    return result[0];
}

export async function listAllItemsInStorageQuery(storage_id: string, user_id: string) {
    if (user_id == "") {return []}
    const result = await db`SELECT * FROM item WHERE storage_id = ${storage_id} AND storage_id IN (SELECT id FROM storage WHERE owner_id = ${user_id} UNION SELECT storage_id FROM user_storage WHERE user_id = ${user_id});`;
    return result;
}

export async function editItemQuery(name: string, amount: number, unit_of_measurement: string, storage_id: string, user_id: string, data: string, item_id: string, is_damaged: boolean, min_amount: number, image_url: string | null = null) {
    if (user_id == "") {return false;}
    
    // Fetch previous item state to compare maintenance status changes
    const oldItemResult = await db`SELECT * FROM item WHERE id = ${item_id}`;
    const oldItem = oldItemResult[0];

    const result = await db`
        UPDATE item 
        SET amount = ${amount}, 
            name = ${name}, 
            unit_of_measurement = ${unit_of_measurement}, 
            storage_id = ${storage_id}, 
            data = ${JSON.parse(data)}, 
            is_damaged = ${is_damaged}, 
            min_amount = ${min_amount},
            image_url = COALESCE(${image_url}, image_url)
        WHERE id = ${item_id} 
        AND storage_id IN (
            SELECT id FROM storage WHERE owner_id = ${user_id} 
            UNION 
            SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin'
        )
        RETURNING *;
    `;

    if (result.length !== 0 && oldItem) {
        checkAndTriggerItemMaintenanceNotification(oldItem, result[0], user_id).catch((err) => {
            console.error("Failed to process maintenance status check:", err);
        });
    }

    return result.length !== 0;
}

export async function deleteItemQuery(user_id: string, id: string) {
    if (user_id == "") {return false;}
    return await db.begin(async sql => {
        const itemCheck = await sql`SELECT storage_id FROM item WHERE id = ${id};`;
        const storage_id = itemCheck[0]?.storage_id;
        
        const result = await sql`
            DELETE FROM item 
            WHERE id = ${id} 
            AND storage_id IN (
                SELECT id FROM storage WHERE owner_id = ${user_id} 
                UNION 
                SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin'
            )
            RETURNING *;
        `;
        
        if (result.length !== 0) {
            revalidatePath("/");
            if (storage_id) {
                revalidatePath(`/locations/${storage_id}`);
            }
            return true;
        }
        return false;
    });
}

export async function duplicateItemQuery(user_id: string, item_id: string) {
    if (user_id == "") {return false;}
    const result = await db`
        INSERT INTO item (name, amount, storage_id, unit_of_measurement, data, owner_id, image_url) 
        SELECT name || ' (Copy)', amount, storage_id, unit_of_measurement, data, ${user_id}, image_url 
        FROM item 
        WHERE id = ${item_id} 
        AND storage_id IN (
            SELECT id FROM storage WHERE owner_id = ${user_id}
            UNION
            SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin'
        )
        RETURNING id, storage_id; 
    `;
    if (result.length !== 0) {
        revalidatePath("/");
        const storage_id = result[0].storage_id;
        if (storage_id) {
            revalidatePath(`/locations/${storage_id}`);
        }
    }
    return result;
}

export async function borrowItemQuery(item_id: string, user_id: string, borrowed_to_id: string, notes: string) {
    if (user_id == "") return false;
    return await db.begin(async sql => {
        // Authorization check: User must have access to the item/storage to borrow it
        const itemCheck = await sql`
            SELECT i.storage_id FROM item i
            WHERE i.id = ${item_id}
            AND (
                i.owner_id = ${user_id}
                OR i.storage_id IN (
                    SELECT id FROM storage WHERE owner_id = ${user_id}
                    UNION
                    SELECT storage_id FROM user_storage WHERE user_id = ${user_id}
                )
            );
        `;
        if (itemCheck.length === 0) {
            return false;
        }
        const storage_id = itemCheck[0].storage_id;

        await sql`UPDATE item SET is_borrowed = true, last_borrowed_to = ${borrowed_to_id} WHERE id = ${item_id}`;
        await sql`INSERT INTO item_history (item_id, user_id, action_type, notes) VALUES (${item_id}, ${user_id}, 'borrow', ${notes})`;
        
        revalidatePath("/");
        if (storage_id) {
            revalidatePath(`/locations/${storage_id}`);
        }
        revalidatePath(`/items/${item_id}`);
        revalidatePath("/profile");

        return true;
    });
}

export async function returnItemQuery(item_id: string, user_id: string, notes: string) {
    if (user_id == "") return false;
    return await db.begin(async sql => {
        // Authorization check: User must have access to the item/storage to return it
        const itemCheck = await sql`
            SELECT i.storage_id, i.name, i.is_borrowed,
                   (SELECT MAX(created_at) FROM item_history WHERE item_id = i.id AND action_type = 'borrow') as borrowed_at
            FROM item i 
            WHERE i.id = ${item_id}
            AND (
                i.owner_id = ${user_id}
                OR i.storage_id IN (
                    SELECT id FROM storage WHERE owner_id = ${user_id}
                    UNION
                    SELECT storage_id FROM user_storage WHERE user_id = ${user_id}
                )
            );
        `;
        if (itemCheck.length === 0) {
            return false;
        }
        const itemInfo = itemCheck[0];
        const storage_id = itemInfo.storage_id;

        const isOverdue = itemInfo.is_borrowed && itemInfo.borrowed_at && 
            (new Date().getTime() - new Date(itemInfo.borrowed_at).getTime() > 7 * 24 * 60 * 60 * 1000);

        await sql`UPDATE item SET is_borrowed = false WHERE id = ${item_id}`;
        await sql`INSERT INTO item_history (item_id, user_id, action_type, notes) VALUES (${item_id}, ${user_id}, 'return', ${notes})`;
        
        if (isOverdue && storage_id) {
            sendNotificationToStorageUsers(
                storage_id,
                "Overdue Asset Returned 🔄",
                `"${itemInfo.name}" has been returned and is no longer overdue.`,
                `/items/${item_id}`,
                user_id
            ).catch((err) => {
                console.error("Failed to send return notification:", err);
            });
        }

        revalidatePath("/");
        if (storage_id) {
            revalidatePath(`/locations/${storage_id}`);
        }
        revalidatePath(`/items/${item_id}`);
        revalidatePath("/profile");

        return true;
    });
}

export async function getItemHistoryQuery(item_id: string) {
    return await db`
        SELECT h.*, u.display_name, u.email 
        FROM item_history h 
        LEFT JOIN users u ON h.user_id = u.id 
        WHERE h.item_id = ${item_id} 
        ORDER BY h.created_at DESC
    `;
}

export async function getUsersQuery() {
    return await db`SELECT id, display_name, email FROM users ORDER BY display_name ASC`;
}


//SHARING
export async function getStorageSharesQuery(storage_id: string, user_id: string) {
    if (user_id == "" || !storage_id) {return [];}
    return await db`
        SELECT us.user_id, us.role, u.display_name, u.email 
        FROM user_storage us
        JOIN users u ON us.user_id = u.id
        JOIN storage s ON us.storage_id = s.id
        WHERE us.storage_id = ${storage_id} AND s.owner_id = ${user_id};
    `;
}

export async function shareStorageQuery(new_user_id: string, storage_id: string, role: string, user_id: string) {
    if (user_id == "") {return false;}
    const result = await db`
        INSERT INTO user_storage (user_id, storage_id, role) 
        SELECT ${new_user_id}, ${storage_id}, ${role} 
        WHERE EXISTS (SELECT 1 FROM storage WHERE id = ${storage_id} AND owner_id = ${user_id})
        ON CONFLICT (user_id, storage_id) DO UPDATE SET role = EXCLUDED.role
        RETURNING *;
    `;
    return result.length !== 0;
}

export async function unshareStorageQuery(storage_id: string, user_id: string, owner_id: string) {
    if (user_id == "") {return false;}
    const result = await db`DELETE FROM user_storage WHERE storage_id = ${storage_id} AND user_id = ${user_id} AND EXISTS (SELECT 1 FROM storage WHERE id = ${storage_id} AND owner_id = ${owner_id});`;
    return result.length !== 0;
}


//TEMPLATE
export async function createTemplateQuery(user_id: string, name: string, data: string) {
    if (user_id == "") {return false;}
    const result = await db`INSERT INTO item_patterns (user_id, name, fields) VALUES (${user_id}, ${name}, ${data}) RETURNING *;`;
    return result.length !== 0;
}

export async function getTemplateQuery(user_id: string, name: string) {
    if (user_id == "") {return false;}
    const result = await db`SELECT * FROM item_patterns WHERE user_id = ${user_id} AND name = ${name}`;
    return result[0];
}

export async function listAllTemplatesQuery(user_id: string) {
    if (user_id == "") {return false;}
    const result = await db`SELECT * FROM item_patterns WHERE user_id = ${user_id}`;
    return result as unknown as TemplatesRow[];
}

export async function listAllTemplatesNamesQuery(user_id: string) {
    if (user_id == "") {return false;}
    const result = await db`SELECT name FROM item_patterns WHERE user_id = ${user_id}`;
    return result as unknown as TemplatesRow[];
}

export async function searchItemsQuery(user_id: string, searchTerm: string) {
    if (user_id === "") return [];
    const term = `%${searchTerm}%`;
    const result = await db`
        SELECT i.*, s.name as storage_name 
        FROM item i
        JOIN storage s ON i.storage_id = s.id
        LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id}
        WHERE (i.owner_id = ${user_id} OR us.user_id IS NOT NULL)
        ${searchTerm ? db`AND (i.name ILIKE ${term} OR s.name ILIKE ${term})` : db``};
    `;
    return result;
}

export async function getMaintenanceItemsQuery(user_id: string) {
    if (user_id === "") return [];
    const result = await db`
        SELECT i.*, s.name as storage_name,
               (SELECT MAX(created_at) FROM item_history WHERE item_id = i.id AND action_type = 'borrow') as borrowed_at
        FROM item i
        JOIN storage s ON i.storage_id = s.id
        LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id}
        WHERE (i.owner_id = ${user_id} OR us.user_id IS NOT NULL)
        AND (
            i.is_damaged = true 
            OR i.amount <= i.min_amount
            OR (i.is_borrowed = true AND (SELECT MAX(created_at) FROM item_history WHERE item_id = i.id AND action_type = 'borrow') < NOW() - INTERVAL '7 days')
        );
    `;
    return result;
}

export async function removeTemplate(user_id: string, template_id: string) {
    if (user_id == "") {return false;}
    const result = await db`DELETE FROM item_patterns WHERE user_id = ${user_id} AND id = ${template_id}`;
    return result.length === 0;
}

export async function moveItemQuery(item_id: string, user_id: string, target_storage_id: string, notes: string) {
    if (user_id === "" || !target_storage_id) return false;
    return await db.begin(async sql => {
        // 1. Get the current storage info to write in the history notes
        const currentItem = await sql`
            SELECT i.storage_id, s.name as storage_name 
            FROM item i 
            LEFT JOIN storage s ON i.storage_id = s.id 
            WHERE i.id = ${item_id}
        `;
        const oldStorageId = currentItem[0]?.storage_id;
        const oldStorageName = currentItem[0]?.storage_name || 'Unknown';

        // 2. Get target storage name
        const targetStorage = await sql`SELECT name FROM storage WHERE id = ${target_storage_id}`;
        const newStorageName = targetStorage[0]?.name || 'Unknown';

        // 3. Update the storage_id of the item
        const updateResult = await sql`
            UPDATE item 
            SET storage_id = ${target_storage_id} 
            WHERE id = ${item_id} 
            AND (
                owner_id = ${user_id} 
                OR storage_id IN (
                    SELECT id FROM storage WHERE owner_id = ${user_id}
                    UNION
                    SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin'
                )
            )
            RETURNING *;
        `;

        if (updateResult.length === 0) {
            return false;
        }

        // 4. Log the move action in item_history
        const historyNotes = notes ? `${notes} (from ${oldStorageName} to ${newStorageName})` : `Moved from ${oldStorageName} to ${newStorageName}`;
        await sql`
            INSERT INTO item_history (item_id, user_id, action_type, notes) 
            VALUES (${item_id}, ${user_id}, 'move', ${historyNotes})
        `;

        // Revalidate caches to reflect changes instantly
        revalidatePath("/");
        if (oldStorageId) {
            revalidatePath(`/locations/${oldStorageId}`);
        }
        if (target_storage_id) {
            revalidatePath(`/locations/${target_storage_id}`);
        }
        revalidatePath(`/items/${item_id}`);

        return true;
    });
}

export async function getDashboardStatsQuery(user_id: string) {
    if (user_id === "") return { storagesCount: 0, itemsCount: 0, borrowedCount: 0 };
    
    const storages = await db`
        SELECT COUNT(*)::int as count 
        FROM storage 
        WHERE owner_id = ${user_id} 
        OR id IN (SELECT storage_id FROM user_storage WHERE user_id = ${user_id});
    `;
    
    const items = await db`
        SELECT COUNT(*)::int as count 
        FROM item 
        WHERE owner_id = ${user_id}
        OR storage_id IN (
            SELECT id FROM storage WHERE owner_id = ${user_id}
            UNION
            SELECT storage_id FROM user_storage WHERE user_id = ${user_id}
        );
    `;
    
    const borrowed = await db`
        SELECT COUNT(*)::int as count 
        FROM item 
        WHERE last_borrowed_to = ${user_id} 
        AND is_borrowed = true;
    `;
    
    return {
        storagesCount: storages[0]?.count || 0,
        itemsCount: items[0]?.count || 0,
        borrowedCount: borrowed[0]?.count || 0
    };
}

export async function getUserBorrowedItemsQuery(user_id: string) {
    if (user_id === "") return [];
    
    return await db`
        SELECT i.id, i.name, i.image_url, i.storage_id, s.name as storage_name,
               (SELECT MAX(created_at) FROM item_history WHERE item_id = i.id AND action_type = 'borrow') as borrowed_at
        FROM item i
        LEFT JOIN storage s ON i.storage_id = s.id
        WHERE i.last_borrowed_to = ${user_id} 
        AND i.is_borrowed = true
        ORDER BY borrowed_at DESC;
    `;
}