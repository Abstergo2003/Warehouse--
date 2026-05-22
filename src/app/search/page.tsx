"use client"

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { searchItemsQuery } from "@/lib/actions/queries";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { InputSearchBar, LoaderBusy } from "react-windows-ui";
import { Table } from "@/app/components/table";
import Link from "next/link";

export default function SearchPage() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (term: string) => {
        setSearchTerm(term);
        if (session?.user?.id) {
            setLoading(true);
            const searchResults = await searchItemsQuery(session.user.id, term);
            setResults(searchResults || []);
            setLoading(false);
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
