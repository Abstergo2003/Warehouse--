import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { ProfileForm } from "./profileForm";

export default async function Profile() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return (
        <ProfileForm user={session.user} />
    );
}