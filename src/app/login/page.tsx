/* eslint-disable @next/next/no-img-element */
import { signIn } from "@/app/auth"
import styles from "@/app/login/page.module.css"
import { redirect } from 'next/navigation';
import {auth} from "@/app/auth"
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
          <h1>Login with your Google account</h1>
        <button type="submit" className={styles.loginButton}><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" alt="google-logo" /><h3>Log in with Google</h3></button>
      </form>
    </div>
  )
}