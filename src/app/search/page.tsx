"use client"

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchItemsQuery } from "@/lib/actions/queries";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { InputSearchBar, LoaderBusy } from "react-windows-ui";
import { Table } from "@/app/components/table";
import Link from "next/link";
import { withOfflineCache, getCachedAllItems } from "@/lib/offlineCache";
import { Item } from "@/lib/types";

export default function SearchPage() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (term: string) => {
        setSearchTerm(term);
        if (session?.user?.id) {
            const userId = session.user.id;
            setLoading(true);
            try {
                const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
                if (isOnline) {
                    // Wrap empty query cache so we capture the master list
                    const cacheKey = term === "" ? `search_all:${userId}` : `search_term:${userId}:${term}`;
                    const searchResults = await withOfflineCache<Item[]>(cacheKey, () => searchItemsQuery(userId, term) as unknown as Promise<Item[]>, []);
                    setResults(searchResults || []);
                } else {
                    // Offline local scan!
                    const cachedItems = getCachedAllItems();
                    if (term === "") {
                        setResults(cachedItems);
                    } else {
                        const filtered = cachedItems.filter(item => 
                            item.name?.toLowerCase().includes(term.toLowerCase()) || 
                            item.storage_name?.toLowerCase().includes(term.toLowerCase())
                        );
                        setResults(filtered);
                    }
                }
            } catch (err) {
                console.warn("Search query failed, falling back to local scan", err);
                const cachedItems = getCachedAllItems();
                if (term === "") {
                    setResults(cachedItems);
                } else {
                    const filtered = cachedItems.filter(item => 
                        item.name?.toLowerCase().includes(term.toLowerCase()) || 
                        item.storage_name?.toLowerCase().includes(term.toLowerCase())
                    );
                    setResults(filtered);
                }
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (session?.user?.id) {
            handleSearch("");
        }
    }, [session?.user?.id, handleSearch]);

    const tableColumns = [
        { name: "Item Name" },
        { name: "Amount" },
        { name: "Unit" },
        { name: "Storage" }
    ];

    const tableRows = results.map(item => [
        <Link href={`/items/${item.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{item.name}</Link>,
        item.amount.toString(),
        item.unit_of_measurement || "-",
        item.storage_name || "Unknown"
    ]);

    return (
        <WindowsPageContainer>
            <div style={{ padding: '20px' }}>
                <h1>Search</h1>
                <br />
                <InputSearchBar 
                    placeholder="Search for items or locations..."
                    onChange={(e: any) => handleSearch(e.target.value)}
                    width="100%"
                />
                <br />
                {loading && <LoaderBusy isLoading={true} size="default" />}
                <br />
                {results.length > 0 ? (
                    <Table 
                        columns={tableColumns}
                        items={tableRows}
                    />
                ) : searchTerm.length > 0 ? (
                    <p>No results found for "{searchTerm}"</p>
                ) : (
                    <p>No items found or you don't have access to any items.</p>
                )}
            </div>
        </WindowsPageContainer>
    );
}
