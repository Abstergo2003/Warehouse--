import { signIn } from "@/lib/auth"
import Image from "next/image";
import styles from "@/app/login/page.module.css"
import { redirect } from 'next/navigation';
import {auth} from "@/lib/auth"
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");
  return (
    <div className={styles.loginBox}>
      <form
        action={async () => {
          "use server"
          await signIn("google")
        }}>
          <h1>Log In</h1>
        <button type="submit" className={styles.loginButton}>
          <Image 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" 
            alt="Google Logo"
            width={40}
            height={40}
          />
          <h3>Log in with Google</h3></button>
      </form>
    </div>
  )
}