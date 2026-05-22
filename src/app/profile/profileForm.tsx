"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { updateDisplayName } from "@/lib/actions/updateDisplayName"
import LockIcon from "../icons/LogOut";
import {AnimatedIconHandle} from "@/lib/types"
import { InputText } from "react-windows-ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileForm({ user }: { user: any }) {
    const iconRef = useRef<AnimatedIconHandle>(null);
    const [name, setName] = useState(user.name ?? "");
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (name !== user.name) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [name, user.name]);

    return (
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 150px)' }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '500px', 
                padding: '40px', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255,255,255,0.05)',
                textAlign: 'center' 
            }}>
                {user.image && (
                    <Image
                        src={user.image}
                        alt="Profile"
                        width={120}
                        height={120}
                        style={{ borderRadius: '50%', marginBottom: '30px', border: '2px solid var(--primary)' }}
                    />
                )}

                <InputText 
                    value={name} 
                    onChange={(e: any) => setName(e.target.value)}
                    placeholder="Display Name"
                    label="Display Name"
                    width="100%"
                />
                <br />
                <InputText 
                    value={user.email ?? ""} 
                    readOnly 
                    label="Email Address"
                    width="100%"
                />
                <br />
                <button 
                    onMouseEnter={()=>{iconRef.current?.startAnimation()}}
                    onMouseLeave={() => iconRef.current?.stopAnimation()}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{ 
                        width: '100%',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '10px', 
                        padding: '12px',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 59, 48, 0.1)',
                        color: '#ff3b30',
                        border: '1px solid #ff3b30',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: '20px'
                    }}
                >
                    <LockIcon ref={iconRef} />
                    <span>Log Out</span>
                </button>
            </div>

            <button 
                style={{ 
                    position: 'fixed',
                    bottom: '40px',
                    right: isDirty ? "40px" : "-300px",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    padding: '12px 30px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    fontWeight: 'bold',
                    zIndex: 100
                }}
                onClick={() => {
                    updateDisplayName(name)
                }}
            >
                Save Changes
            </button>
        </div>
    );
}