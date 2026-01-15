
"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { signOut } from "next-auth/react"; // Important: client version
import { updateDisplayName } from "@/lib/actions"
import LockIcon from "../icons/LogOut";
import {AnimatedIconHandle} from "@/app/icons/types"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileForm({ user }: { user: any }) {
    const iconRef = useRef<AnimatedIconHandle>(null);
    const [name, setName] = useState(user.name ?? "");
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (name !== user.name) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [name, user.name]);

    return (
        <>
            <div className={styles.profileBox}>
                <Image 
                    src={user.image ?? ""}
                    alt="Profile"
                    className={styles.profileLogo}
                    width={150}
                    height={150}
                />

                <br />
                <input 
                    type="text" 
                    className={styles.inputDisplay} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Display Name"
                />
                <br />
                <input 
                    type="text" 
                    className={styles.inputDisplay} 
                    value={user.email ?? ""} 
                    readOnly 
                />
                <br />
                <button 
                    onMouseEnter={()=>{iconRef.current?.startAnimation()}}
                    onMouseLeave={() => iconRef.current?.stopAnimation()}
                    className={styles.profileButton} 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LockIcon
                    ref={iconRef} />
                    <span>Log Out</span>
                    
                </button>
            </div>

            <button 
                className={styles.saveButton}
                style={{ 
                    right: isDirty ? "50px" : "-250px",
                    transition: "all 0.3s ease-in-out"
                }}
                onClick={() => {
                    updateDisplayName(name)
                }}
            >
                Save Changes
            </button>
        </>
    );
}