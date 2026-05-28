"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { updateDisplayName } from "@/lib/actions/updateDisplayName"
import LockIcon from "../icons/LogOut";
import { AnimatedIconHandle } from "@/lib/types"
import { InputText, Button } from "react-windows-ui";
import { returnItemQuery } from "@/lib/actions/queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileForm({ user, borrowedItems }: { user: any; borrowedItems: any[] }) {
    const iconRef = useRef<AnimatedIconHandle>(null);
    const [name, setName] = useState(user.name ?? "");
    const [isDirty, setIsDirty] = useState(false);
    const [localBorrowedItems, setLocalBorrowedItems] = useState<any[]>(borrowedItems);
    const [returningId, setReturningId] = useState<string | null>(null);

    const [pushSupported, setPushSupported] = useState(false);
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [submittingPush, setSubmittingPush] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
            setPushSupported(true);
            
            navigator.serviceWorker.ready.then(async (registration) => {
                const subscription = await registration.pushManager.getSubscription();
                setPushSubscribed(!!subscription);
            }).catch(err => {
                console.error("Error checking push subscription:", err);
            });
        }
    }, []);

    const handleSubscribePush = async () => {
        setSubmittingPush(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                alert("Permission for notifications was denied.");
                setSubmittingPush(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BMOISFO2qqAt-3KTIoTCaL1pqLTTUSEqwydamWthl8qvn-4kwj7LFcCoZjlsuGtMiyYlMZTII-oQUxidokE7850";
            
            if (!publicVapidKey) {
                alert("VAPID public key is not configured.");
                setSubmittingPush(false);
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            const response = await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                setPushSubscribed(true);
                alert("Push notifications enabled successfully!");
            } else {
                alert("Failed to save push subscription on the server.");
            }
        } catch (error) {
            console.error("Error enabling push notifications:", error);
            alert("An error occurred while enabling notifications.");
        } finally {
            setSubmittingPush(false);
        }
    };

    const handleUnsubscribePush = async () => {
        setSubmittingPush(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setPushSubscribed(false);
                alert("Push notifications disabled.");
            }
        } catch (error) {
            console.error("Error disabling push notifications:", error);
            alert("An error occurred while disabling notifications.");
        } finally {
            setSubmittingPush(false);
        }
    };

    function urlBase64ToUint8Array(base64String: string) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    useEffect(() => {
        setLocalBorrowedItems(borrowedItems);
    }, [borrowedItems]);

    useEffect(() => {
        if (name !== user.name) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [name, user.name]);

    const handleReturnItem = async (itemId: string) => {
        if (!confirm("Are you sure you want to return this asset to its storage location?")) return;
        setReturningId(itemId);
        try {
            const success = await returnItemQuery(itemId, user.id, "Returned directly via profile dashboard");
            if (success) {
                setLocalBorrowedItems(prev => prev.filter(item => item.id !== itemId));
                alert("Asset returned successfully!");
            } else {
                alert("Failed to return asset.");
            }
        } catch (error) {
            console.error("Error returning asset:", error);
            alert("An error occurred while returning the asset.");
        } finally {
            setReturningId(null);
        }
    };

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1.2fr', 
            gap: '40px', 
            width: '100%', 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '40px 20px' 
        }} className="mobile-grid-1">
            
            {/* Left Column: Account Details Edit Form */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                    width: '100%', 
                    padding: '40px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                }}
                className="mobile-padding-compact"
                >
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt="Profile"
                            width={120}
                            height={120}
                            style={{ borderRadius: '50%', marginBottom: '25px', border: '3px solid var(--primary)', boxShadow: '0 0 15px rgba(163, 140, 244, 0.2)' }}
                        />
                    ) : (
                        <div style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            border: '3px solid rgba(255,255,255,0.1)', 
                            margin: '0 auto 25px auto', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                        }}>
                            <i className="icons10-user" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.3)' }}></i>
                        </div>
                    )}

                    <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{user.name || "User"}</h2>
                    <div style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#332b4d', color: '#a38cf4', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '30px' }}>
                        Registered Member
                    </div>

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
                    
                    {pushSupported && (
                        <div style={{
                            textAlign: 'left',
                            padding: '15px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="icons10-notification" style={{ fontSize: '18px', color: pushSubscribed ? '#4ade80' : '#a38cf4' }}></i>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Push Notifications</span>
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: pushSubscribed ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                                    color: pushSubscribed ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                    fontWeight: 'bold'
                                }}>
                                    {pushSubscribed ? 'ENABLED' : 'DISABLED'}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.5, lineHeight: '1.4', color: 'white' }}>
                                Get alerts when assets in your warehouses are damaged, restocked, or overdue.
                            </p>
                            <button
                                onClick={pushSubscribed ? handleUnsubscribePush : handleSubscribePush}
                                disabled={submittingPush}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: pushSubscribed ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)',
                                    color: 'white',
                                    border: pushSubscribed ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {submittingPush ? 'Processing...' : pushSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
                            </button>
                        </div>
                    )}

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
                            backgroundColor: 'rgba(255, 59, 48, 0.08)',
                            color: '#ff3b30',
                            border: '1px solid rgba(255, 59, 48, 0.2)',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                        className="logout-hover-btn"
                    >
                        <LockIcon ref={iconRef} />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>

            {/* Right Column: Currently Borrowed Assets */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    width: '100%', 
                    padding: '40px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    minHeight: '100%'
                }}
                className="mobile-padding-compact"
                >
                    <h3 style={{ margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="icons10-clock" style={{ color: '#fbbf24', fontSize: '24px' }}></i>
                        <span>My Checked Out Assets</span>
                        <span style={{ 
                            marginLeft: 'auto', 
                            fontSize: '13px', 
                            padding: '2px 8px', 
                            backgroundColor: 'rgba(251, 191, 36, 0.1)', 
                            color: '#fbbf24', 
                            borderRadius: '20px',
                            fontWeight: 'bold' 
                        }}>
                            {localBorrowedItems.length}
                        </span>
                    </h3>

                    {localBorrowedItems.length === 0 ? (
                        <div style={{ 
                            padding: '50px 30px', 
                            textAlign: 'center', 
                            backgroundColor: 'rgba(255,255,255,0.01)', 
                            border: '1px dashed rgba(255,255,255,0.08)', 
                            borderRadius: '10px', 
                            opacity: 0.6,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px'
                        }}>
                            <i className="icons10-checkmark" style={{ fontSize: '40px', color: '#4ade80' }}></i>
                            <div style={{ fontSize: '15px', fontWeight: '500' }}>
                                No checked out assets under your responsibility.
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {localBorrowedItems.map((item) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '15px 20px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '10px',
                                    gap: '15px',
                                    transition: 'background-color 0.2s'
                                }} className="mobile-stack-flex hover-glass">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexGrow: 1, minWidth: 0 }}>
                                        <div style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            position: 'relative', 
                                            borderRadius: '6px', 
                                            overflow: 'hidden', 
                                            backgroundColor: '#111',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            flexShrink: 0
                                        }}>
                                            <Image
                                                unoptimized={true}
                                                src={item.image_url || "/icons/icon.png"}
                                                alt={item.name}
                                                fill
                                                style={{ objectFit: 'contain', padding: item.image_url ? '0' : '8px' }}
                                            />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <a 
                                                href={`/items/${item.id}`} 
                                                style={{ fontWeight: 'bold', color: 'white', textDecoration: 'none', fontSize: '15px' }}
                                                className="hover-underline"
                                            >
                                                {item.name}
                                            </a>
                                            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <i className="icons10-map-marker" style={{ fontSize: '11px', color: 'var(--primary)' }}></i>
                                                <span>From: {item.storage_name || 'Unassigned'}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '3px' }}>
                                                Borrowed on {new Date(item.borrowed_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mobile-full-width">
                                        <Button
                                            value={returningId === item.id ? "Returning..." : "Return"}
                                            onClick={() => handleReturnItem(item.id)}
                                            disabled={returningId !== null}
                                            style={{ height: '32px', padding: '0 15px', fontSize: '13px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Save Changes Button */}
            <button 
                className={`save-changes-btn ${isDirty ? 'dirty' : ''}`}
                onClick={() => {
                    updateDisplayName(name)
                }}
            >
                Save Changes
            </button>
        </div>
    );
}