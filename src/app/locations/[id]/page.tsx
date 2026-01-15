import Image from "next/image"
import styles from "./page.module.css"
import { Table } from "@/app/components/table"

export default function LocationByID() {
    //dummy data to display table
    const tableData = {
        controls: [
            {name: "Name", "width": 30}, 
            {name: "Ammount", "width": 20}, 
            {name: "Cost", "width": 20},
            {name: "On Site", "width": 20},
        ],
        items: [
            ["Test1", "Test2", "Test3", "Test4"], 
            ["Test5", "Test6", "Test7", "Test8"], 
            ["Test9", "Test10", "Test11", "Test12"], 
            ["Test13", "Test14", "Test15", "Test16"], 
            ["Test17", "Test18", "Test19", "Test20"]
        ]
    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.summary}>
                <Image src="/icons/icon.png" width={80} height={80} alt="" />
                <span>Warehouse 1</span>
                <p>50 PLN</p>
                <button style={{right: "100px", backgroundColor: "var(--warning)"}}>Edit</button>
                <button style={{right: "10px", backgroundColor: "var(--danger)"}}>Delete</button>
            </div>
            <Table columns={tableData.controls} 
                items={tableData.items}></Table>
        </div>
    )
}