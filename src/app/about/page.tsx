import { signIn } from "@/app/auth"
export const dynamic = "force-dynamic";
export default function LoginButtons() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <button type="submit">Zaloguj przez Google</button>
    </form>
  )
}