import { auth } from "@/lib/auth";
import { ProfileForm } from "./profileForm";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { getUserBorrowedItemsQuery } from "@/lib/actions/queries";

export default async function Profile() {
    const session = await auth();
    const userId = session?.user?.id || "";
    const borrowedItems = await getUserBorrowedItemsQuery(userId);

    // Safe serialization for Next.js Client Component boundary
    const serializedBorrowedItems = borrowedItems.map((item: any) => ({
        ...item,
        borrowed_at: item.borrowed_at ? new Date(item.borrowed_at).toISOString() : null
    }));

    return (
        <WindowsPageContainer>
            <ProfileForm user={session?.user} borrowedItems={serializedBorrowedItems} />
        </WindowsPageContainer>
    );
}