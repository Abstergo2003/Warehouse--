'use client'

import { useEffect, useState } from 'react';
import { getCachedAllItems } from '@/lib/offlineCache';
import WindowsPageContainer from '@/app/components/WindowsPageContainer';
import { InputSearchBar } from 'react-windows-ui';
import { Table } from '@/app/components/table';
import Link from 'next/link';

export default function OfflinePage() {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cached = getCachedAllItems();
    setAllItems(cached);
    setFilteredItems(cached);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredItems(allItems);
    } else {
      const lower = term.toLowerCase();
      const filtered = allItems.filter(item => 
        (item.name && item.name.toLowerCase().includes(lower)) ||
        (item.storage_name && item.storage_name.toLowerCase().includes(lower)) ||
        (item.unit_of_measurement && item.unit_of_measurement.toLowerCase().includes(lower))
      );
      setFilteredItems(filtered);
    }
  };

  const columns = [
    { name: "Item Name" },
    { name: "Amount" },
    { name: "Unit" },
    { name: "Storage" }
  ];

  const tableRows = filteredItems.map(item => [
    <Link 
      key={item.id} 
      href={`/items/${item.id}`} 
      style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
    >
      {item.name}
    </Link>,
    item.amount.toString(),
    item.unit_of_measurement || "-",
    item.storage_name || "Cached Location"
  ]);

  if (!mounted) return null;

  return (
    <WindowsPageContainer>
      <div 
        style={{ 
          padding: '40px 20px', 
          maxWidth: '850px', 
          margin: '0 auto', 
          fontFamily: 'var(--font-oxanium), sans-serif',
          color: '#ffffff'
        }}
      >
        {/* Connection status card */}
        <div style={{
          background: 'rgba(30, 24, 15, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          borderRadius: '12px',
          padding: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '35px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }} className="mobile-stack-flex">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '28px', color: '#fbbf24', animation: 'blink 2s infinite' }}>!</span>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes blink {
              0% { opacity: 0.5; }
              50% { opacity: 1; }
              100% { opacity: 0.5; }
            }
          ` }} />

          <div>
            <h2 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fbbf24', fontWeight: 700 }}>Offline Mode</h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '14px', lineHeight: '1.5' }}>
              Your device has lost its internet connection. However, the system is actively displaying and searching over your **locally cached inventory index**.
            </p>
          </div>
        </div>

        {/* Local Search Area */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', fontWeight: 600 }}>
            Search Local Catalog ({allItems.length} items cached)
          </h3>
          <InputSearchBar 
            placeholder="Filter offline items or warehouses..."
            onChange={(e: any) => handleSearch(e.target.value)}
            width="100%"
          />
        </div>

        {/* Local Results Table */}
        {filteredItems.length > 0 ? (
          <Table 
            columns={columns}
            items={tableRows}
          />
        ) : (
          <div style={{
            padding: '50px 20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ opacity: 0.5, margin: 0, fontSize: '15px' }}>
              {searchTerm ? "No local matching items found in cache." : "No offline catalog items registered in this device's cache."}
            </p>
          </div>
        )}
      </div>
    </WindowsPageContainer>
  );
}
