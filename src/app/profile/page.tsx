import { auth } from "@/lib/auth";
import { ProfileForm } from "./profileForm";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";

export default async function Profile() {
    const session = await auth();

    return (
        <WindowsPageContainer>
            <ProfileForm user={session?.user} />
        </WindowsPageContainer>
    );
}