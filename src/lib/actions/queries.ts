"use server"
import { Storage, TemplatesRow } from '@/app/icons/types';

// STORAGE
import db from '@/lib/db'


export async function createStorageQuery(name: string, owner_id: string, localization: string, storage_area: number, img_url: string) {
    const result = await db`INSERT INTO storage (name, owner_id, localization, storage_area, img_url) VALUES (${name}, ${owner_id}, ${localization}, ${storage_area}, ${img_url}) RETURNING *;`;
    return result.length !== 0;
}

export async function listAvailibleStoragesQuery(user_id: string) {
    const result = await db`SELECT s.*, COALESCE(us.role, CASE WHEN s.owner_id = ${user_id} THEN 'owner' END) as effective_role FROM storage s LEFT JOIN user_storage us ON s.id = us.storage_id AND us.user_id = ${user_id} WHERE s.owner_id = ${user_id} OR us.user_id IS NOT NULL;`;
    return result as unknown as Storage[];
}

export async function editStorageQuery(name: string, localization: string, id: string, owner_id: string) {
    const result = await db`UPDATE storage SET name = ${name}, localization = ${localization} WHERE id = ${id} AND owner_id = ${owner_id};`;
    return result.length !== 0;
}

export async function deleteStorageQuery(id: string, owner_id: string) {
    const result = await db`DELETE FROM storage WHERE id = ${id} AND owner_id = ${owner_id};`;
    return result.length !== 0;
}


// ITEM
export async function createItemQuery(name: string, amount: number, unit_of_measurement: string, image_url:string, storage_id: string, user_id: string, data: string) {
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

export async function listAllItemsInStorageQuery(storage_id: string, user_id: string) {
    const result = await db`SELECT * FROM item WHERE storage_id = ${storage_id} AND storage_id IN (SELECT id FROM storage WHERE owner_id = ${user_id} UNION SELECT storage_id FROM user_storage WHERE user_id = ${user_id});`;
    return result;
}

export async function editItemQuery(amount: number, name: string, id: string, user_id: string,) {
    const result = await db`UPDATE item SET amount = ${amount}, name = ${name} WHERE id = ${id} AND storage_id IN (SELECT id FROM storage WHERE owner_id = ${user_id} UNION SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin');`
    return result.length !== 0;
}

export async function deleteItemQuery(id: string, user_id: string) {
    const result = await db`DELETE FROM item WHERE id = ${id} AND storage_id IN (SELECT id FROM storage WHERE owner_id = ${user_id} UNION SELECT storage_id FROM user_storage WHERE user_id = ${user_id} AND role = 'admin');`
    return result.length !== 0;
}


//SHARING
export async function shareStorageQuery(new_user_id: string, storage_id: string, user_id: string) {
    const result = await db`INSERT INTO user_storage (user_id, storage_id, role) SELECT ${new_user_id}, ${storage_id}, 'viewer' WHERE EXISTS (SELECT 1 FROM storage WHERE id = ${storage_id} AND owner_id = ${user_id});`;
    return result.length !== 0;
}

export async function unshareStorageQuery(storage_id: string, user_id: string, owner_id: string) {
    const result = await db`DELETE FROM user_storage WHERE storage_id = ${storage_id} AND user_id = ${user_id} AND EXISTS (SELECT 1 FROM storage WHERE id = ${storage_id} AND owner_id = ${owner_id});`;
    return result.length !== 0;
}


//TEMPLATE
export async function createTemplateQuery(user_id: string, name: string, data: string) {
    const result = await db`INSERT INTO item_patterns (user_id, name, fields) VALUES (${user_id}, ${name}, ${data}) RETURNING *;`;
    return result.length !== 0;
}

export async function getTemplateQuery(user_id: string, name: string) {
    const result = await db`SELECT * FROM item_patterns WHERE user_id = ${user_id} AND name = ${name}`;
    return result[0];
}

export async function listAllTemplatesQuery(user_id: string) {
    const result = await db`SELECT * FROM item_patterns WHERE user_id = ${user_id}`;
    return result as unknown as TemplatesRow[];
}

export async function listAllTemplatesNamesQuery(user_id: string) {
    const result = await db`SELECT name FROM item_patterns WHERE user_id = ${user_id}`;
    return result as unknown as TemplatesRow[];
}

export async function removeTemplate(user_id: string, template_id: string) {
    const result = await db`DELETE FROM item_patterns WHERE user_id = ${user_id} AND id = ${template_id}`;
    return result.length === 0;
}