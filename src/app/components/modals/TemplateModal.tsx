import { createTemplateAction } from "@/lib/actions/createTemplate";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FieldType } from "@/app/icons/types";

export default function TemplateModal() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    const [fields, setFields] = useState<FieldType[]>([]);
    const [name, setName] = useState("");

    const handleManualSubmit = async () => {
        const validFields = fields.filter(f => f.name.trim() !== "");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("data", JSON.stringify(validFields)); 
        
        await createTemplateAction(formData);
        close();
    };

    const updateField = (index: number, key: keyof FieldType, value: string) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const close = () => {
        dialogRef.current?.close();
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <dialog ref={dialogRef} onClose={close} className="warehouseEditer" id="fieldModal">
            <span style={{float: "right", cursor: "pointer"}} onClick={close}>X</span>
            <h3>Create Template</h3>
            <br />
            
            <label htmlFor="createItemName">Name:</label><br />
            <input 
                id="createItemName" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
            /><br />
            <br />
            
            <label>Fields:</label>
            <button 
                style={{float: "right"}} 
                onClick={() => setFields([...fields, {name: "", type: "text", defVal:""}])}
            >
                Add
            </button><br />
            <br />
            
            {fields.map((field, i) => (
                <FieldField 
                    key={i} 
                    index={i} 
                    fieldData={field} 
                    onChange={updateField} 
                />
            ))}
            
            <br /><br />
            <button onClick={handleManualSubmit}>Create</button>
        </dialog>
    );
}

function FieldField(props: { 
    index: number; 
    fieldData: FieldType; 
    onChange: (index: number, key: keyof FieldType, value: string) => void 
}) {
    return(
        <div className="fieldfield">
            <label>Name:</label><br />
            <input 
                type="text" 
                value={props.fieldData.name}
                onChange={(e) => props.onChange(props.index, "name", e.target.value)}
            /><br />
            
            <label>Type:</label><br />
            <select 
                value={props.fieldData.type} 
                onChange={(e) => props.onChange(props.index, "type", e.target.value)}
            >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select><br />
            
            <label>Default:</label><br />
            <input 
                type={props.fieldData.type}
                value={props.fieldData.defVal}
                onChange={(e) => props.onChange(props.index, "defVal", e.target.value)}
            />
        </div>
    );
}