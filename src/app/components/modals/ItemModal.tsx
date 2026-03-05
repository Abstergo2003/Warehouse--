"use client";
import { createItemAction } from "@/lib/actions/createItem";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getTemplateQuery, listAllTemplatesNamesQuery, listAvailibleStoragesQuery } from "@/lib/actions/queries";
import { useSession } from "next-auth/react";
import {Storage} from "@/app/icons/types"


export default function ItemEditModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [storageID, setStorageID] = useState("");
  const [unit, setUnit] = useState("");
  const [inputMessage, setInputMessage] = useState("Prześlij Zdjęcie");
  const [storages, setStorages] = useState<Storage[]>([]);
  // const itemID = searchParams.get("id");
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templateInput, setTemplateInput] = useState("");
  const [existsingTemplates, setExistingTemplates] = useState<string[]>([]);

  useEffect(()=>{
    listAvailibleStoragesQuery(session?.user?.id || "").then(storages => {
      return setStorages(storages);
    });
    listAllTemplatesNamesQuery(session?.user?.id || "").then(templates => {
      const arr = [];
      for (let i = 0; i< templates.length; i++) {
        arr.push(templates[i].name)
      }
      return setExistingTemplates(arr);
    })

  }, [session?.user?.id, status])

  const handlePickClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setInputMessage(file.name);
      }
      
  };

  const handleTemplateSelect = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const trimmedInput = templateInput.trim();
      console.log(existsingTemplates);
      if (trimmedInput !== "" && !selectedTemplates.includes(trimmedInput) && existsingTemplates.includes(trimmedInput)) {
        setSelectedTemplates([...selectedTemplates, trimmedInput]);
        setTemplateInput("");
      }
    }
  };

  const handleManualSubmit = async () => {
    const templateData = [];
    for (let i = 0; i< selectedTemplates.length; i++) {
        const partData = await getTemplateQuery(session?.user?.id || "", selectedTemplates[i]);
        templateData.push(partData);
      }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("amount", amount.toString());
    formData.append("storage_id", storageID);
    formData.append("unit", unit);
    formData.append("data", JSON.stringify(templateData));
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    await createItemAction(formData);
    close();
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
    <dialog ref={dialogRef} onClose={close} className="warehouseEditer">
      <span style={{float: "right"}} onClick={close}>X</span>
      <h3>Create Item</h3>
      <br />
      <label htmlFor="">Location</label><br />
      <select id="" onChange={(e)=>{setStorageID(e.target.value);}}>
        <option value="">Choose Storage</option>
        {storages.map(storage =>
          <option key={storage.id} value={storage.id}>{storage.name}</option>
        )}
      </select>
      <br />
      <br />
      <label htmlFor="createItemName">Name:</label><br />
      <input id="createItemName" type="text" onChange={(e)=>{setName(e.target.value)}}/><br />
      <br />
      <label htmlFor="createItemAmmount">Ammount:</label><br />
      <input id="createItemAmmount" type="number" onChange={(e) => {setAmount(e.target.valueAsNumber)}}/><br />
      <br />
      <label htmlFor="createItemAmmount">Unit:</label><br />
      <input id="createItemIUnit" type="text" onChange={(e) => {setUnit(e.target.value)}}/><br />
      <br />
      <label htmlFor="">Template</label><br />
      <div 
        className="templateInputContainer" 
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", border: "1px solid var(--border)", padding: "4px", minHeight: "34px", borderRadius: "5px"}}
      >
        {selectedTemplates.map((template, index) => (
          <span 
            key={index} 
            style={{ backgroundColor: "var(--primary)", padding: "2px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            {template}
            <b style={{cursor: "pointer", fontSize: "12px"}} onClick={() => setSelectedTemplates(selectedTemplates.filter(t => t !== template))}>x</b>
          </span>
        ))}
        
        <input 
          type="text"
          value={templateInput}
          onChange={(e) => setTemplateInput(e.target.value)}
          onKeyDown={handleTemplateSelect}
          placeholder={selectedTemplates.length === 0 ? "Wpisz i wciśnij Enter..." : ""}
          style={{ border: "none", outline: "none", flexGrow: 1, minWidth: "100px" }}
        />
      </div>
      <br />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <label htmlFor="">Zdjęcie przedmiotu</label>
      <p onClick={handlePickClick}>{inputMessage}</p>
      <br />
      <button onClick={handleManualSubmit}>Create</button>
    </dialog>
  );
}