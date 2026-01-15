"use client"

import { useMemo, useState } from "react"
import ArrowDown01Icon from "../icons/Sort"
import styles from "./table.module.css"
import { a } from "motion/react-client"

export function Table(props: {
    columns: {name: string, width: number}[]
    items: string[][]
}) {
    const [sortColumnIndex, setSortColumnIndex] = useState(0);
    const [isDescending, setIsDescending] = useState(false);

    const sortedItems = useMemo(() => {
        const itemsCopy = [...props.items];

        itemsCopy.sort((a, b) => {
            const valA = a[sortColumnIndex];
            const valB = b[sortColumnIndex];

            const comparison = valA.localeCompare(valB, undefined, { numeric: true });

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
    return(
        <div className={styles.tableWrapper}>
            <div className={styles.tableControlls}>
                <table>
                    <tbody>
                        <tr>
                            {props.columns.map((column, i) => 
                                <td key={`tableControll${i}`} onClick={() => handleHeaderClick(i)} style={{width: `${column.width}%`}}><span>{column.name}&nbsp;<ArrowDown01Icon size={20}></ArrowDown01Icon></span></td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.tableContents}>
                <table>
                    <tbody>
                            {props.items.length == 0 ? <span style={{display: "block", width: "100%", textAlign:"center", paddingTop: "20px", paddingBottom: "20px"}}>No items here</span> : <></>}
                            {sortedItems.map((item, i) =>
                                <tr key={`tabelRowOne${i}`}>
                                    {item.map((name, i) => 
                                    <td key={`tabelRowTwo${i}`} style={{width: `${props.columns[i].width}%`}}><a href="/items/">{name}</a></td>)}
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}