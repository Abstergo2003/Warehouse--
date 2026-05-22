"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FieldType, TemplatesRow } from "../../lib/types";
import { listAllTemplatesQuery, removeTemplate } from "@/lib/actions/queries";
import TrashIcon from "../icons/Trash";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";


export default function TemplatesPage() {
    const { data: session, status } = useSession();
    const [templates, setTemplates] = useState<TemplatesRow[]>([]);
    useEffect(()=> {
        const id = session?.user?.id;
        if (id) {
            listAllTemplatesQuery(id).then(queryResult => {
                if (queryResult) {
                    setTemplates(queryResult);
                }
            })
        }
    }, [session?.user?.id, status])

    const handleDeleteTemplate = (idToRemove: string) => {
        const user_id = session?.user?.id;
        if (user_id) {
            removeTemplate(user_id, idToRemove).then(queryResult => {
                if (queryResult) {
                    setTemplates(templates.filter(template => template.id !== idToRemove));
                }
            });
        }
    };
    return(
    <WindowsPageContainer>
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Templates</h1>
                <a href="?modal=add-template">
                    <button style={{ padding: '8px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Create Template
                    </button>
                </a>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {templates.map(template => 
                    <TemplateElement 
                        key={template.id}
                        id={template.id}
                        name={template.name} 
                        fields={template.fields}
                        onDelete={() => handleDeleteTemplate(template.id)} 
                    />
                )}
            </div>
            {templates.length === 0 && <p>No templates found. Create one to get started!</p>}
        </div>
    </WindowsPageContainer>
    )
}

function TemplateElement(props: {
    name: string,
    fields: FieldType[],
    id: string,
    onDelete: () => void
}) {
    return (
        <div id={props.id} style={{ 
            padding: '20px', 
            border: '1px solid var(--border)', 
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{props.name}</h3>
                <button 
                    onClick={props.onDelete}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                >
                    <TrashIcon size={20} />
                </button>
            </div>
            <br />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {props.fields.map((field, i) => (
                    <div key={i} style={{ fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                        <div style={{ fontWeight: 'bold' }}>{field.name}</div>
                        <div style={{ opacity: 0.7, fontSize: '12px' }}>Type: {field.type} | Default: {field.defVal || 'None'}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
