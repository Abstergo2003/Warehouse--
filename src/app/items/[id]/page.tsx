'use client'

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TrashIcon from "../../icons/Trash" 
import StackIcon from "../../icons/Duplicate";
import { Item } from "../../../lib/types";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { deleteItemQuery, duplicateItemQuery, editItemQuery, getItemInfoQuery, getItemHistoryQuery, getUsersQuery, borrowItemQuery, returnItemQuery, listAllTemplatesQuery } from "@/lib/actions/queries";
import { editItemAction } from "@/lib/actions/createItem";
import { NavPageContainer, InputText, LoaderBusy, Button, Dialog } from "react-windows-ui";
import Link from "next/link";
import { TemplatesRow } from "@/lib/types";

export default function ItemPage() {
    const params = useParams();
    const router = useRouter();
    const item_id = params.id as string;
    const { data: session, status } = useSession();
    
    const [item, setItem] = useState<Item>();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<TemplatesRow[]>([]);
    const [showBorrowDialog, setShowBorrowDialog] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [borrowToId, setBorrowToId] = useState("");
    const [borrowNotes, setBorrowToNotes] = useState("");
    const [returnNotes, setReturnNotes] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [itemName, setItemName] = useState("");
    const [itemAmount, setItemAmount] = useState<number>(0);
    const [itemUnitOfMeasurement, setItemUnitOfMeasurement] = useState("");
    const [itemIsDamaged, setItemIsDamaged] = useState(false);
    const [itemMinAmount, setItemMinAmount] = useState<number>(0);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const refreshData = async () => {
        const userId = session?.user?.id || "";
        
        // Always fetch basic data
        const [itemData, historyData, usersData] = await Promise.all([
            getItemInfoQuery(userId, item_id),
            getItemHistoryQuery(item_id),
            getUsersQuery()
        ]);
        
        if (itemData && itemData.name) {
            if (typeof itemData.data === "string") {
                try { itemData.data = JSON.parse(itemData.data); } catch (e) { itemData.data = []; }
            }
            setItem(itemData as Item);
            setItemName(itemData.name);
            setItemAmount(itemData.amount);
            setItemUnitOfMeasurement(itemData.unit_of_measurement);
            setItemIsDamaged(itemData.is_damaged);
            setItemMinAmount(itemData.min_amount || 0);
        }
        
        setHistory(historyData);
        setUsers(usersData);
        setLoading(false);

        // Fetch templates separately if userId exists
        if (userId) {
            const templatesData = await listAllTemplatesQuery(userId);
            if (Array.isArray(templatesData)) {
                setTemplates(templatesData);
            }
        }
    };

    const handleApplyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        setItem(prevItem => {
            if (!prevItem) return prevItem;
            // Add template fields to existing data
            return {
                ...prevItem,
                data: [...prevItem.data, { ...template }]
            };
        });
    };

    const handleRemoveCategory = (catIdx: number) => {
        if (!confirm("Are you sure you want to remove this whole category of specifications?")) return;
        setItem(prevItem => {
            if (!prevItem) return prevItem;
            const newData = [...prevItem.data];
            newData.splice(catIdx, 1);
            return {
                ...prevItem,
                data: newData
            };
        });
    };

    useEffect(() => {
        refreshData();
    }, [item_id, session?.user, status]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this item?")) {
            const success = await deleteItemQuery(session?.user?.id || "", item_id);
            if (success) {
                router.push(`/locations/${item?.storage_id || ''}`);
            }
        }
    }

    const handleFieldChange = (categoryIndex: number, fieldIndex: number, newValue: string) => {
        setItem((prevItem) => {
            if (!prevItem) return prevItem;
            const newData = [...prevItem.data];
            newData[categoryIndex].fields[fieldIndex].defVal = newValue;
            return { ...prevItem, data: newData };
        });
    };

    const handleSave = async () => {
        if (!item || !session?.user?.id) return;
        try {
            const formData = new FormData();
            formData.append("item_id", item_id);
            formData.append("name", itemName);
            formData.append("amount", itemAmount.toString());
            formData.append("storage_id", item.storage_id);
            formData.append("unit", itemUnitOfMeasurement);
            formData.append("is_damaged", itemIsDamaged.toString());
            formData.append("min_amount", itemMinAmount.toString());
            formData.append("data", JSON.stringify(item.data));
            if (selectedFile) {
                formData.append("image", selectedFile);
            }
            
            await editItemAction(formData);
            
            alert("Changes saved successfully!");
            setSelectedFile(null);
            setPreviewUrl(null);
            refreshData();
        } catch (error) {
            console.error("Error saving:", error);
            alert("Nie udało się zapisać zmian.");
        }
    };

    const handleDuplicate = async () => {
        if (!item || !session?.user?.id) return;
        try {
            const result = await duplicateItemQuery(session.user.id, item_id);
            if (result && result[0]) {
                router.push(`/items/${result[0].id}`);
            }
        } catch (error){
            console.error("Error while duplicating", error);
        }
    }

    const handleBorrow = async () => {
        if (!session?.user?.id || !borrowToId) return;
        const success = await borrowItemQuery(item_id, session.user.id, borrowToId, borrowNotes);
        if (success) {
            setShowBorrowDialog(false);
            refreshData();
        }
    }

    const handleReturn = async () => {
        if (!session?.user?.id) return;
        const success = await returnItemQuery(item_id, session.user.id, returnNotes);
        if (success) {
            setShowReturnDialog(false);
            setReturnNotes("");
            refreshData();
        }
    }

    if (loading) {
        return (
            <NavPageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoaderBusy isLoading={true} size="large" />
                </div>
            </NavPageContainer>
        );
    }

    if (!item) {
        return (
            <NavPageContainer>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Item not found</h1>
                    <Link href="/">Go back home</Link>
                </div>
            </NavPageContainer>
        );
    }

    return (
        <NavPageContainer>
            <div style={{ paddingBottom: '100px', height: '100%', overflowY: 'auto' }}>
                {/* Header / Breadcrumb */}
                <div style={{ padding: '20px 40px 0 40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', opacity: 0.7 }}>
                    <Link href="/locations" style={{ color: 'inherit' }}>Inventory</Link>
                    <span>/</span>
                    <span>{item.name}</span>
                </div>

                <div style={{ padding: '20px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    
                    {/* Left Column: Images */}
                    <div>
                        <div style={{ 
                            width: '100%', 
                            aspectRatio: '16/10', 
                            position: 'relative', 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            backgroundColor: '#111',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Image
                                unoptimized={true}
                                src={previewUrl || item.image_url || "/icons/icon.png"} 
                                alt={item.name}
                                fill
                                style={{ objectFit: 'contain', padding: (previewUrl || item.image_url) ? '0' : '40px' }}
                            />
                        </div>
                        {isEditing && (
                            <div style={{ marginTop: '15px' }}>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--primary)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <i className="icons10-camera" style={{ fontSize: '16px' }}></i>
                                    {selectedFile ? selectedFile.name : "Change Photo"}
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <span style={{ padding: '2px 10px', backgroundColor: '#332b4d', color: '#a38cf4', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>WAREHOUSE ITEM</span>
                                <span style={{ padding: '2px 10px', backgroundColor: item.amount > 0 ? '#1c332d' : '#331c1c', color: item.amount > 0 ? '#4ade80' : '#ff4a4a', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {item.amount > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                </span>
                                {item.is_borrowed && (
                                    <span style={{ padding: '2px 10px', backgroundColor: '#33261c', color: '#fbbf24', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>BORROWED</span>
                                )}
                            </div>
                            {isEditing ? (
                                <InputText 
                                    value={itemName}
                                    onChange={(e: any) => setItemName(e.target.value)}
                                    placeholder="Item Name"
                                    // style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: '600', border: 'none', background: 'transparent' }}
                                />
                            ) : (
                                <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: '600' }}>{item.name}</h1>
                            )}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '16px', opacity: 0.6 }}>{item.amount} {item.unit_of_measurement} available in storage.</span>
                                </div>
                            <p style={{ fontSize: '16px', opacity: 0.6, lineHeight: '1.6', maxWidth: '500px' }}>
                                Tracked asset managed by Warehouse MS. Registered on {new Date(item.added_at).toLocaleDateString()}.
                            </p>
                        </div>

                        {/* Asset ID Card */}
                        <div style={{ 
                            padding: '20px', 
                            backgroundColor: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '4px', padding: '5px' }}>
                                <Image unoptimized={true} src="/icons/icon.png" alt="QR" width={50} height={50} style={{ filter: 'invert(1)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.5, letterSpacing: '1px' }}>ASSET ID</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{item_id.toUpperCase()}</div>
                                <div style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', marginTop: '5px' }}>
                                    <i className="icons10-print" style={{ marginRight: '5px' }}></i> PRINT LABEL
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <Button 
                                type="primary"
                                value={isEditing ? "Save Changes" : "Edit Details"}
                                onClick={async () => {
                                    if (isEditing) {
                                        await handleSave();
                                    }
                                    setIsEditing(!isEditing);
                                }}
                                style={{ height: '45px', fontWeight: 'bold' }}
                            />
                            {item.is_borrowed ? (
                                <Button 
                                    value="Return to Storage"
                                    onClick={() => setShowReturnDialog(true)}
                                    style={{ height: '45px', fontWeight: 'bold', backgroundColor: '#1c332d', color: '#4ade80' }}
                                />
                            ) : (
                                <Button 
                                    value="Mark as Borrowed"
                                    onClick={() => setShowBorrowDialog(true)}
                                    style={{ height: '45px', fontWeight: 'bold', backgroundColor: '#33261c', color: '#fbbf24' }}
                                />
                            )}
                            <Button 
                                value="Duplicate"
                                onClick={handleDuplicate}
                                style={{ height: '45px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)' }}
                            />
                            <Button 
                                type="danger"
                                value="Delete Asset"
                                onClick={handleDelete}
                                style={{ height: '45px', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Grid: Specs & Other Logs */}
                <div style={{ padding: '0 40px 40px 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                    
                    {/* Specifications Cards (Dynamic from Real Data) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Array.isArray(item.data) && item.data.map((category, catIdx) => (
                            <div key={category.id || catIdx} style={{ 
                                padding: '30px', 
                                backgroundColor: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderRadius: '16px' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="icons10-list" style={{ color: 'var(--primary)' }}></i> {category.name}
                                    </h3>
                                    {isEditing && (
                                        <button 
                                            onClick={() => handleRemoveCategory(catIdx)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                color: '#ff4a4a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <TrashIcon size={16} /> Remove Category
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    {category.fields.map((field, fldIdx) => (
                                        <div key={fldIdx}>
                                            <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{field.name}</div>
                                            {isEditing ? (
                                                <InputText
                                                    type={field.type as any}
                                                    value={field.defVal || ""}
                                                    onChange={(e: any) => handleFieldChange(catIdx, fldIdx, e.target.value)}
                                                    width="100%"
                                                />
                                            ) : (
                                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{field.defVal || '-'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {isEditing && (
                            <div style={{ 
                                padding: '20px', 
                                backgroundColor: 'rgba(255,255,255,0.02)', 
                                border: '1px dashed rgba(255,255,255,0.2)', 
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px' }}>Append specifications from template</div>
                                <select 
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleApplyTemplate(e.target.value);
                                            e.target.value = ""; // Reset dropdown
                                        }
                                    }}
                                    style={{ 
                                        padding: '8px 15px', 
                                        backgroundColor: '#111', 
                                        color: 'white', 
                                        border: '1px solid rgba(255,255,255,0.2)', 
                                        borderRadius: '4px',
                                        width: '200px'
                                    }}
                                >
                                    <option value="">Select template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Borrow History */}
                        <div style={{ 
                            padding: '30px', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '16px' 
                        }}>
                            <h3 style={{ margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="icons10-history" style={{ color: '#fbbf24' }}></i> Activity History
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {history.length > 0 ? history.map((h, i) => (
                                    <div key={i} style={{ 
                                        padding: '15px', 
                                        backgroundColor: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>
                                                {h.action_type === 'borrow' ? 'Borrowed' : 'Returned'}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.6 }}>{h.notes || 'No notes provided'}</div>
                                            <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '4px' }}>by {h.display_name || h.email}</div>
                                        </div>
                                        <div style={{ fontSize: '12px', opacity: 0.5 }}>
                                            {new Date(h.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', opacity: 0.4, padding: '20px' }}>No activity history yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Purchase Details Card */}
                        <div style={{ 
                            padding: '30px', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '16px' 
                        }}>
                            <h3 style={{ margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="icons10-shopping-cart" style={{ color: '#4ade80' }}></i> Stock Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.5 }}>Added Date</span>
                                    <span>{new Date(item.added_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.5 }}>Current Stock</span>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <InputText 
                                                // type="number"
                                                value={itemAmount}
                                                onChange={(e: any) => setItemAmount(parseFloat(e.target.value))}
                                                width="80px"
                                            />
                                            <InputText 
                                                value={itemUnitOfMeasurement}
                                                onChange={(e: any) => setItemUnitOfMeasurement(e.target.value)}
                                                width="80px"
                                            />
                                        </div>
                                    ) : (
                                        <span>{item.amount} {item.unit_of_measurement}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.5 }}>Minimum Level</span>
                                    {isEditing ? (
                                        <InputText 
                                            
                                            value={itemMinAmount}
                                            onChange={(e: any) => setItemMinAmount(parseFloat(e.target.value))}
                                            width="80px"
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 'bold' }}>{item.min_amount || 'Not set'} {item.unit_of_measurement}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Log */}
                        <div style={{ 
                            padding: '30px', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '16px' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="icons10-settings" style={{ color: '#fbbf24' }}></i> Asset Status
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Condition</div>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={itemIsDamaged} 
                                                onChange={(e) => setItemIsDamaged(e.target.checked)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '12px', opacity: 0.8 }}>Mark as Damaged</span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{item.is_damaged ? 'Damaged' : 'Excellent'}</div>
                                    )}
                                </div>
                                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Availability</div>
                                    <div style={{ fontSize: '12px', opacity: 0.5 }}>{item.is_borrowed ? `Borrowed` : 'Available in storage'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Location History */}
                        {/* <div style={{ 
                            padding: '30px', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '16px',
                            display: 'flex',
                            gap: '20px'
                        }}>
                            <div style={{ flexGrow: 1 }}>
                                <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="icons10-map-marker" style={{ color: '#f87171' }}></i> Storage Info
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '5px' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Storage ID</div>
                                            <div style={{ fontSize: '12px', opacity: 0.5, wordBreak: 'break-all' }}>{item.storage_id}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Borrow Dialog */}
            <Dialog isVisible={showBorrowDialog} onBackdropPress={() => setShowBorrowDialog(false)}>
                <div style={{ padding: '30px', width: '400px' }}>
                    <h3>Borrow Asset</h3>
                    <br />
                    <label>Select User</label><br />
                    <select 
                        value={borrowToId} 
                        onChange={(e) => setBorrowToId(e.target.value)}
                        style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                    >
                        <option value="">Choose a user...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.display_name || u.email}</option>
                        ))}
                    </select>
                    <br /><br />
                    <InputText 
                        label="Notes"
                        placeholder="Purpose of borrowing..."
                        value={borrowNotes}
                        onChange={(e: any) => setBorrowToNotes(e.target.value)}
                        width="100%"
                    />
                    <br />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button value="Cancel" onClick={() => setShowBorrowDialog(false)} />
                        <Button type="primary" value="Borrow" onClick={handleBorrow} disabled={!borrowToId} />
                    </div>
                </div>
            </Dialog>

            {/* Return Dialog */}
            <Dialog isVisible={showReturnDialog} onBackdropPress={() => setShowReturnDialog(false)}>
                <div style={{ padding: '30px', width: '400px' }}>
                    <h3>Return Asset</h3>
                    <br />
                    <InputText 
                        label="Notes"
                        placeholder="Condition upon return..."
                        value={returnNotes}
                        onChange={(e: any) => setReturnNotes(e.target.value)}
                        width="100%"
                    />
                    <br />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button value="Cancel" onClick={() => setShowReturnDialog(false)} />
                        <Button type="primary" value="Return Asset" onClick={handleReturn} />
                    </div>
                </div>
            </Dialog>
        </NavPageContainer>
    )
}
