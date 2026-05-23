import { createTemplateAction } from "@/lib/actions/createTemplate";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FieldType } from "@/lib/types";
import { Dialog, InputText } from "react-windows-ui";

export default function TemplateModal() {
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

    const close = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Dialog isVisible={true} onBackdropPress={close}>
            <div style={{padding: "20px", width: "100%", maxWidth: "400px", maxHeight: "80vh", overflowY: "auto"}} className="mobile-padding-compact">
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <h3>Create Template</h3>
                    <span style={{cursor: "pointer", fontWeight: "bold"}} onClick={close}>X</span>
                </div>
                <br />
                
                <InputText 
                    label="Template Name"
                    value={name} 
                    onChange={(e: any) => setName(e.target.value)}
                    width="100%"
                />
                <br />
                
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '10px'}}>
                    <label>Fields</label>
                    <button 
                        onClick={() => setFields([...fields, {name: "", type: "text", defVal:""}])}
                        style={{ padding: '5px 15px', cursor: 'pointer' }}
                    >
                        Add Field
                    </button>
                </div>
                
                {fields.map((field, i) => (
                    <FieldField 
                        key={i} 
                        index={i} 
                        fieldData={field} 
                        onChange={updateField} 
                    />
                ))}
                
                <br />
                <button 
                    onClick={handleManualSubmit}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Create
                </button>
            </div>
        </Dialog>
    );
}

function FieldField(props: { 
    index: number; 
    fieldData: FieldType; 
    onChange: (index: number, key: keyof FieldType, value: string) => void 
}) {
    return(
        <div className="fieldfield" style={{padding: "10px", border: "1px solid var(--border)", marginBottom: "15px", borderRadius: '4px'}}>
            <InputText 
                label="Field Name"
                value={props.fieldData.name}
                onChange={(e: any) => props.onChange(props.index, "name", e.target.value)}
                width="100%"
            />
            <br />
            
            <label>Type</label><br />
            <select 
                value={props.fieldData.type} 
                onChange={(e) => props.onChange(props.index, "type", e.target.value)}
                style={{width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: '5px'}}
            >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select><br /><br />
            
            <InputText 
                label="Default Value"
                type={props.fieldData.type as any}
                value={props.fieldData.defVal}
                onChange={(e: any) => props.onChange(props.index, "defVal", e.target.value)}
                width="100%"
            />
        </div>
    );
}