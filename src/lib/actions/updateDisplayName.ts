"use server";

import sql from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateDisplayName(newName: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        await sql`
            UPDATE users 
            SET display_name = ${newName} 
            WHERE id = ${session.user.id}
        `;

        revalidatePath("/profile");
        
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to update name" };
    }
}