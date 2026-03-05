"use client"
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { FieldType, TemplatesRow } from "../icons/types";
import { listAllTemplatesQuery, removeTemplate } from "@/lib/actions/queries";
import TrashIcon from "../icons/Trash";

export default function TemplatesPage() {
    const { data: session, status } = useSession();
    const [templates, setTemplates] = useState<TemplatesRow[]>([]);
    useEffect(()=> {
        const id = session?.user?.id;
        listAllTemplatesQuery(id!).then(queryResult => {
            setTemplates(queryResult);
        })
    }, [session?.user?.id, status])

    const handleDeleteTemplate = (idToRemove: string) => {
        const user_id = session?.user?.id;
        removeTemplate(user_id!, idToRemove).then(queryResult => {
            console.log(queryResult);
            if (queryResult) {
                setTemplates(templates.filter(template => template.id !== idToRemove));
            }
        });
    };
    return(
    <div className={styles.TemplatesPage}>
        <div><h3>Templates</h3><a href="?modal=add-template"><button>Create</button></a></div>
        {templates.map(template => 
                <TemplateElement 
                    key={template.id}
                    id={template.id}
                    name={template.name} 
                    fields={template.fields}
                    onDelete={() => handleDeleteTemplate(template.id)} 
                />)}
    </div>
    )
}

function TemplateElement(props: {
    name: string,
    fields: FieldType[],
    id: string,
    onDelete: () => void
}) {
    return (
        <div id={props.id} className={styles.templateElement}>
            <h4>{props.name}</h4>
            <button className="button" onClick={props.onDelete}>
                <TrashIcon size={30} />
            </button>
            <br />
            
            {props.fields.map((field, i) => (
                <div key={i}>
                    <span>{field.name}</span>
                    <span>{field.type}</span>
                    <span>{field.defVal}</span>
                    <br /><br />
                </div>
            ))}
        </div>
    )
}