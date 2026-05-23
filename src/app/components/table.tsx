"use client"

import { useMemo, useState } from "react"

export function Table(props: {
    columns: {name: string, width?: number}[]
    items: (string | React.ReactNode)[][]
}) {
    const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
    const [isDescending, setIsDescending] = useState(false);

    const sortedItems = useMemo(() => {
        if (sortColumnIndex === null) return props.items;

        const itemsCopy = [...props.items];
        itemsCopy.sort((a, b) => {
            const valA = a[sortColumnIndex];
            const valB = b[sortColumnIndex];

            // Extraction of text content if it's a ReactNode for comparison
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getSortValue = (val: any): string => {
                if (typeof val === 'string') return val;
                if (typeof val === 'number') return String(val);
                if (val && val.props && val.props.children) {
                    if (typeof val.props.children === 'string') return val.props.children;
                    if (Array.isArray(val.props.children)) return val.props.children.join('');
                }
                return '';
            };

            const strA = getSortValue(valA);
            const strB = getSortValue(valB);

            const comparison = strA.localeCompare(strB, undefined, { numeric: true });
            return isDescending ? -comparison : comparison;
        });

        return itemsCopy;
    }, [props.items, sortColumnIndex, isDescending]);

    const handleHeaderClick = (index: number) => {
        if (sortColumnIndex === index) {
            setIsDescending(!isDescending);
        } else {
            setSortColumnIndex(index);
            setIsDescending(false);
        }
    };

    return (
        <div className="ui-table-view-container" style={{ 
            marginTop: '20px',
            border: '1px solid var(--color-ui-border-default)',
            borderRadius: '4px',
            overflowX: 'auto',
            backgroundColor: 'var(--color-card-bg-default)',
            maxWidth: "100%",
            width: "100%"
        }}>
            <table className="ui-table-view" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-ui-border-default)' }}>
                        {props.columns.map((column, i) => (
                            <th 
                                key={i} 
                                onClick={() => handleHeaderClick(i)}
                                style={{ 
                                    textAlign: 'left',
                                    padding: '12px 20px',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap'
                                }}
                                className="sortable"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {column.name}
                                    {sortColumnIndex === i && (
                                        <i className={isDescending ? "icons10-arrow-down" : "icons10-arrow-up"} style={{ fontSize: '14px' }}></i>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ borderBottom: '1px solid var(--color-ui-border-default)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} style={{ padding: '12px 20px', fontSize: '15px' }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {props.items.length === 0 && (
                <div style={{ padding: '30px', textAlign: 'center', opacity: 0.6 }}>
                    No items found in this location.
                </div>
            )}
        </div>
    )
}
