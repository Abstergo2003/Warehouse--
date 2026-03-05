"use server"

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createTemplateQuery } from "./queries";

export async function createTemplateAction(formData: FormData) {
    const session = await auth();
    createTemplateQuery(session!.user!.id!, formData.get("name")!.toString(), JSON.parse(formData.get("data")!.toString()))
    revalidatePath("/templates");
}