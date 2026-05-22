'use client'

import Image from "next/image"
import { Table } from "@/app/components/table"
import { NavPageContainer, LoaderBusy } from "react-windows-ui"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getStorageInfoQuery, listAllItemsInStorageQuery, getStorageSharesQuery } from "@/lib/actions/queries"
import { DeleteWarehouseAction } from "@/lib/actions/createWarehouse"

export default function LocationByID() {
    const params = useParams();
    const router = useRouter();
    const storageId = params.id as string;
    const { data: session } = useSession();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [storage, setStorage] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [shares, setShares] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (session?.user?.id && storageId) {
            Promise.all([
                getStorageInfoQuery(storageId, session.user.id),
                listAllItemsInStorageQuery(storageId, session.user.id),
                getStorageSharesQuery(storageId, session.user.id)
            ]).then(([storageData, itemsData, sharesData]) => {
                setStorage(storageData);
                setItems(itemsData || []);
                setShares(sharesData || []);
                setLoading(false);
            }).catch(err => {
                console.error("Error fetching location data:", err);
                setLoading(false);
            });
        }
    }, [session?.user?.id, storageId]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this warehouse? This action cannot be undone.")) {
            setIsDeleting(true);
            const success = await DeleteWarehouseAction(storageId);
            if (success) {
                router.push("/locations");
            } else {
                alert("Failed to delete warehouse. Make sure you are the owner.");
                setIsDeleting(false);
            }
        }
    };

    if (loading || isDeleting) {
        return (
            <NavPageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoaderBusy isLoading={true} size="large" />
                </div>
            </NavPageContainer>
        );
    }

    if (!storage) {
        return (
            <NavPageContainer>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Location not found</h1>
                    <p>You might not have permission to view this warehouse or it doesn&apos;t exist.</p>
                    <br />
                    <Link href="/locations">Go back to warehouses</Link>
                </div>
            </NavPageContainer>
        );
    }

    const tableColumns = [
        { name: "Name", width: 40 },
        { name: "Amount", width: 20 },
        { name: "Unit", width: 20 },
        { name: "Added At", width: 20 },
    ];

    const tableRows = items.map(item => [
        <Link key={item.id} href={`/items/${item.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
            {item.name}
        </Link>,
        item.amount.toString(),
        item.unit_of_measurement || "-",
        new Date(item.added_at).toLocaleDateString()
    ]);

    return (
        <NavPageContainer>
            <div style={{ height: '250px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <Image 
                    unoptimized={true}
                    src={storage.img_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvrQDevxLylxtjB6kG5bRLqoJ8m4ZxjKc7GQ&s"} 
                    fill 
                    alt="Warehouse Banner" 
                    style={{ objectFit: 'cover', filter: 'brightness(0.6)' }}
                />
                <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    padding: '30px 40px', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '36px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{storage.name}</h1>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                             <p style={{ 
                                display: 'inline-block',
                                padding: '4px 14px', 
                                backgroundColor: 'var(--primary)', 
                                borderRadius: '15px',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                margin: 0
                            }}>{storage.effective_role.toUpperCase()}</p>
                            <p style={{ margin: 0, color: 'white', fontSize: '14px', opacity: 0.9 }}>
                                <i className="icons10-map" style={{ marginRight: '5px' }}></i>
                                {storage.storage_area} m² Area
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {storage.effective_role === 'owner' && (
                            <>
                                <Link href={`?modal=share-warehouse&storageId=${storageId}`}>
                                    <button style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}>
                                        Share Space
                                    </button>
                                </Link>
                                <Link href={`?modal=add-warehouse&editId=${storageId}`}>
                                    <button style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}>Edit Details</button>
                                </Link>
                                <button 
                                    onClick={handleDelete}
                                    style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 59, 48, 0.8)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
                                >
                                    Delete Warehouse
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ 
                width: '95%', 
                margin: '0 auto', 
                padding: '30px 0' 
            }}>
                {shares.length > 0 && (
                    <div style={{ 
                        marginBottom: '30px', 
                        padding: '15px 20px', 
                        backgroundColor: 'rgba(255,255,255,0.02)', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>Shared with:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {shares.map(share => (
                                <div key={share.user_id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '5px 12px', 
                                    backgroundColor: 'rgba(255,255,255,0.04)', 
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <span style={{ 
                                        width: '8px', 
                                        height: '8px', 
                                        borderRadius: '50%', 
                                        backgroundColor: share.role === 'admin' ? '#FFCC00' : '#007AFF' 
                                    }}></span>
                                    <strong>{share.display_name}</strong> 
                                    <span style={{ opacity: 0.6 }}>({share.role})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Inventory Overview</h2>
                    <Link href={`?modal=add-item&storageId=${storageId}`}>
                        <button style={{ padding: '10px 25px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                            + Add New Item
                        </button>
                    </Link>
                </div>

                <div style={{ minHeight: '400px', width: "100%" }}>
                    <Table columns={tableColumns} items={tableRows}></Table>
                </div>

                {items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '8px', marginTop: '20px' }}>
                        <i className="icons10-box" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
                        <p style={{ fontSize: '18px' }}>This warehouse is currently empty.</p>
                        <p>Click &quot;Add New Item&quot; to start managing your stock.</p>
                    </div>
                )}
            </div>
        </NavPageContainer>
    )
}
