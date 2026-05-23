"use client"

import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getMaintenanceItemsQuery } from "@/lib/actions/queries";
import { LoaderBusy } from "react-windows-ui";
import { Table } from "@/app/components/table";
import Link from "next/link";

export default function MaintenancePage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            getMaintenanceItemsQuery(session.user.id).then((data) => {
                setItems(data || []);
                setLoading(false);
            });
        }
    }, [session?.user?.id]);

    if (loading) {
        return (
            <WindowsPageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoaderBusy isLoading={true} size="large" />
                </div>
            </WindowsPageContainer>
        );
    }

    const tableColumns = [
        { name: "Item Name" },
        { name: "Storage" },
        { name: "Status" },
        { name: "Stock" },
        { name: "Min. Level" }
    ];

    const tableRows = items.map(item => {
        const issues = [];
        if (item.is_damaged) issues.push(<span key={item.id} style={{ color: '#ff4a4a', backgroundColor: 'rgba(255,74,74,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>DAMAGED</span>);
        if (item.amount <= item.min_amount) issues.push(<span key={item.id} style={{ color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>LOW STOCK</span>);
        
        const isLongTermBorrowed = item.is_borrowed && item.borrowed_at && (new Date().getTime() - new Date(item.borrowed_at).getTime() > 7 * 24 * 60 * 60 * 1000);
        if (isLongTermBorrowed) issues.push(<span key={item.id} style={{ color: '#a38cf4', backgroundColor: 'rgba(163,140,244,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>OVERDUE ({Math.floor((new Date().getTime() - new Date(item.borrowed_at).getTime()) / (24 * 60 * 60 * 1000))}d)</span>);

        return [
            <Link key={item.id} href={`/items/${item.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>{item.name}</Link>,
            item.storage_name || "Unknown",
            <div key={item.id} style={{ display: 'flex', gap: '5px' }}>{issues}</div>,
            `${item.amount} ${item.unit_of_measurement}`,
            `${item.min_amount} ${item.unit_of_measurement}`
        ];
    });

    return (
        <WindowsPageContainer>
            <div style={{ padding: '40px', height: '100%', overflowY: 'auto', paddingBottom: '100px' }} className="mobile-padding-compact">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }} className="mobile-stack-flex">
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <i className="icons10-settings" style={{ fontSize: '32px', color: '#fbbf24' }}></i>
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '600' }} className="responsive-title-h1">Maintenance & Attention</h1>
                        <p style={{ opacity: 0.5, margin: 0 }}>Reviewing {items.length} assets requiring action</p>
                    </div>
                </div>
                
                {items.length > 0 ? (
                    <Table 
                        columns={tableColumns}
                        items={tableRows}
                    />
                ) : (
                    <div style={{ 
                        padding: '60px 40px', 
                        textAlign: 'center', 
                        backgroundColor: 'rgba(255,255,255,0.02)', 
                        borderRadius: '24px', 
                        border: '1px dashed rgba(255,255,255,0.1)',
                        marginTop: '20px'
                    }} className="mobile-padding-compact">
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                            <i className="icons10-home" style={{ fontSize: '40px', color: '#4ade80' }}></i>
                        </div>
                        <h2 style={{ opacity: 0.9, fontWeight: '600' }}>Everything is in order</h2>
                        <p style={{ opacity: 0.4, maxWidth: '400px', margin: '10px auto 0 auto' }}>No items are currently reported as damaged, below stock, or overdue for return.</p>
                    </div>
                )}
                
                <br /><br />
                <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} className="mobile-padding-compact">
                    <h3 style={{ margin: '0 0 10px 0' }} className="responsive-title-h3">Maintenance Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginTop: '20px' }} className="mobile-grid-4">
                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5 }}>Damaged Assets</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4a4a' }}>{items.filter(i => i.is_damaged).length}</div>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5 }}>Restock Required</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{items.filter(i => i.amount <= i.min_amount).length}</div>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5 }}>Overdue Returns</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a38cf4' }}>{items.filter(i => i.is_borrowed && i.borrowed_at && (new Date().getTime() - new Date(i.borrowed_at).getTime() > 7 * 24 * 60 * 60 * 1000)).length}</div>
                        </div>
                        <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.5 }}>Total Issues</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{items.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </WindowsPageContainer>
    );
}

