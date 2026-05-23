"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, LoaderBusy } from "react-windows-ui";
import { 
    getStorageInfoQuery, 
    getStorageSharesQuery, 
    getUsersQuery, 
    shareStorageQuery, 
    unshareStorageQuery 
} from "@/lib/actions/queries";

export default function ShareWarehouseModal() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const storageId = searchParams.get("storageId");
    
    const [storage, setStorage] = useState<any>(null);
    const [shares, setShares] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states for adding new user
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRole, setSelectedRole] = useState("viewer");

    const loadData = async () => {
        if (!storageId || !session?.user?.id) return;
        try {
            const [storageData, sharesData, usersData] = await Promise.all([
                getStorageInfoQuery(storageId, session.user.id),
                getStorageSharesQuery(storageId, session.user.id),
                getUsersQuery()
            ]);

            setStorage(storageData);
            setShares(sharesData || []);
            setAllUsers(usersData || []);
        } catch (error) {
            console.error("Error loading share data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storageId && session?.user?.id) {
            loadData();
        }
    }, [storageId, session?.user?.id]);

    const handleShare = async () => {
        if (!selectedUserId || !storageId || !session?.user?.id) return;
        setActionLoading(true);
        try {
            const success = await shareStorageQuery(selectedUserId, storageId, selectedRole, session.user.id);
            if (success) {
                // Reset form and reload
                setSelectedUserId("");
                setSelectedRole("viewer");
                await loadData();
            } else {
                alert("Failed to share access.");
            }
        } catch (error) {
            console.error("Error sharing access:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async (targetUserId: string, newRole: string) => {
        if (!storageId || !session?.user?.id) return;
        setActionLoading(true);
        try {
            const success = await shareStorageQuery(targetUserId, storageId, newRole, session.user.id);
            if (success) {
                await loadData();
            } else {
                alert("Failed to update role.");
            }
        } catch (error) {
            console.error("Error updating role:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnshare = async (targetUserId: string) => {
        if (!storageId || !session?.user?.id) return;
        if (!confirm("Are you sure you want to revoke this user's access?")) return;
        
        setActionLoading(true);
        try {
            const success = await unshareStorageQuery(storageId, targetUserId, session.user.id);
            if (success) {
                await loadData();
            } else {
                alert("Failed to revoke access.");
            }
        } catch (error) {
            console.error("Error revoking access:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const close = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("storageId");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Filter available users for selection:
    // 1. Exclude the current owner
    // 2. Exclude users who already have access
    const availableUsers = allUsers.filter(u => 
        u.id !== session?.user?.id && 
        !shares.some(s => s.user_id === u.id)
    );

    return (
        <Dialog isVisible={true} onBackdropPress={close}>
            <div style={{ padding: "20px", width: "100%", maxWidth: "480px" }} className="mobile-padding-compact">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ margin: 0 }}>Share Warehouse</h3>
                    <span style={{ cursor: "pointer", fontWeight: "bold", opacity: 0.7 }} onClick={close}>X</span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <LoaderBusy isLoading={true} size="default" />
                    </div>
                ) : !storage ? (
                    <p style={{ color: "var(--red)", textAlign: "center" }}>Storage not found or you are not authorized.</p>
                ) : (
                    <>
                        <div style={{ marginBottom: "20px" }}>
                            <p style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.6 }}>Warehouse Name</p>
                            <h4 style={{ margin: 0, fontSize: "18px" }}>{storage.name}</h4>
                        </div>

                        {/* Current Shares Section */}
                        <div style={{ marginBottom: "25px" }}>
                            <h4 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "12px", fontSize: "14px" }}>
                                People with Access ({shares.length})
                            </h4>
                            
                            {shares.length === 0 ? (
                                <p style={{ fontSize: "14px", opacity: 0.6, fontStyle: "italic", textAlign: "center", padding: "15px 0" }}>
                                    This warehouse is private. Only you can access it.
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                                    {shares.map(share => (
                                        <div key={share.user_id} style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "center",
                                            padding: "8px 12px",
                                            backgroundColor: "rgba(255,255,255,0.03)",
                                            borderRadius: "6px",
                                            border: "1px solid rgba(255,255,255,0.05)"
                                        }}>
                                            <div style={{ flex: 1, marginRight: "10px" }}>
                                                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{share.display_name || "Warehouse User"}</div>
                                                <div style={{ fontSize: "12px", opacity: 0.6 }}>{share.email}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <select 
                                                    value={share.role}
                                                    onChange={(e) => handleRoleChange(share.user_id, e.target.value)}
                                                    disabled={actionLoading}
                                                    style={{ 
                                                        padding: "4px 8px", 
                                                        border: "1px solid var(--border)", 
                                                        borderRadius: "4px", 
                                                        backgroundColor: "black", 
                                                        color: "white",
                                                        fontSize: "12px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button 
                                                    onClick={() => handleUnshare(share.user_id)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        padding: "4px 8px",
                                                        backgroundColor: "rgba(255, 59, 48, 0.2)",
                                                        color: "rgb(255, 69, 58)",
                                                        border: "1px solid rgba(255, 59, 48, 0.3)",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Grant Access Section */}
                        <div>
                            <h4 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "12px", fontSize: "14px" }}>
                                Share Access with Someone
                            </h4>

                            {availableUsers.length === 0 ? (
                                <p style={{ fontSize: "13px", opacity: 0.6, fontStyle: "italic", textAlign: "center" }}>
                                    No other users available to share with.
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", opacity: 0.6, marginBottom: "5px" }}>Select User</label>
                                        <select 
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid var(--border)",
                                                borderRadius: "4px",
                                                backgroundColor: "black",
                                                color: "white",
                                                fontSize: "14px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <option value="">-- Choose a user --</option>
                                            {availableUsers.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.display_name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", opacity: 0.6, marginBottom: "5px" }}>Choose Role</label>
                                        <select 
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "8px",
                                                border: "1px solid var(--border)",
                                                borderRadius: "4px",
                                                backgroundColor: "black",
                                                color: "white",
                                                fontSize: "14px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <option value="viewer">Viewer (Can only view inventory)</option>
                                            <option value="admin">Admin (Can add, edit, and delete inventory)</option>
                                        </select>
                                    </div>

                                    <button 
                                        onClick={handleShare}
                                        disabled={actionLoading || !selectedUserId}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px', 
                                            backgroundColor: selectedUserId ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                                            color: selectedUserId ? 'white' : 'rgba(255,255,255,0.3)', 
                                            border: 'none', 
                                            borderRadius: '4px',
                                            cursor: selectedUserId ? 'pointer' : 'not-allowed',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            marginTop: '8px',
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        {actionLoading ? <LoaderBusy isLoading={true} size="small" /> : "+ Share Access"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Dialog>
    );
}
