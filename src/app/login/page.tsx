import { signIn } from "@/lib/auth"
import Image from "next/image";
import { redirect } from 'next/navigation';
import {auth} from "@/lib/auth"
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");
  return (
    <WindowsPageContainer>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 100px)' 
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '450px', 
          padding: '40px', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(255,255,255,0.05)',
          textAlign: 'center' 
        }}
        className="mobile-padding-compact"
        >
          <Image 
            unoptimized={true}
            src="/icons/icon.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            style={{ marginBottom: '20px' }}
          />
          <h1 style={{ marginBottom: '10px' }}>Warehouse</h1>
          <p style={{ opacity: 0.7, marginBottom: '40px' }}>Please sign in to continue</p>
          
          <form
            action={async () => {
              "use server"
              await signIn("google")
            }}>
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '15px',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09s.13-1.43.35-2.09z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </WindowsPageContainer>
  )
}