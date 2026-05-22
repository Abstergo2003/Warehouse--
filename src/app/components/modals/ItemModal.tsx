"use client";
import { createItemAction } from "@/lib/actions/createItem";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getTemplateQuery, listAllTemplatesNamesQuery, listAvailibleStoragesQuery } from "@/lib/actions/queries";
import { useSession } from "next-auth/react";
import { Storage } from "@/lib/types";
import { Dialog, InputText } from "react-windows-ui";

export default function ItemEditModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [storageID, setStorageID] = useState(searchParams.get("storageId") || "");
  const [unit, setUnit] = useState("");
  const [inputMessage, setInputMessage] = useState("Prześlij Zdjęcie");
  const [storages, setStorages] = useState<Storage[]>([]);
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templateInput, setTemplateInput] = useState("");
  const [existsingTemplates, setExistingTemplates] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
        listAvailibleStoragesQuery(session.user.id).then(storages => {
          if (storages) {
              setStorages(storages);
              // Pre-select storage from URL if available
              const storageFromUrl = searchParams.get("storageId");
              if (storageFromUrl) {
                  setStorageID(storageFromUrl);
              }
          }
        });
        listAllTemplatesNamesQuery(session.user.id).then(templates => {
          if (templates) {
              const arr = [];
              for (let i = 0; i < templates.length; i++) {
                arr.push(templates[i].name)
              }
              setExistingTemplates(arr);
          }
        });
    }
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
      if (trimmedInput !== "" && !selectedTemplates.includes(trimmedInput) && existsingTemplates.includes(trimmedInput)) {
        setSelectedTemplates([...selectedTemplates, trimmedInput]);
        setTemplateInput("");
      }
    }
  };

  const handleManualSubmit = async () => {
    const templateData = [];
    for (let i = 0; i < selectedTemplates.length; i++) {
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

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* 1. Moved the input completely OUTSIDE the Dialog */}
      <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
      />

      {/* 2. The Dialog components remain identical */}
      <Dialog isVisible={true} onBackdropPress={close}>
        <div style={{padding: "20px", width: "400px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <h3>Create Item</h3>
              <span style={{cursor: "pointer", fontWeight: "bold"}} onClick={close}>X</span>
          </div>
          <br />
          <label htmlFor="">Location</label><br />
          <select onChange={(e)=>{setStorageID(e.target.value);}} style={{width: "100%", padding: "5px", border: "1px solid var(--border)", borderRadius: "4px"}}>
              <option value="">Choose Storage</option>
              {storages.map(storage =>
              <option key={storage.id} value={storage.id}>{storage.name}</option>
              )}
          </select>
          <br />
          <InputText 
              label="Name"
              value={name} 
              onChange={(e: any)=>{setName(e.target.value)}} 
              width="100%"
          />
          <br />
          <label>Ammount</label><br />
          <input 
              type="number" 
              onChange={(e) => {setAmount(e.target.valueAsNumber)}} 
              style={{width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px"}}
          /><br />
          <br />
          <InputText 
              label="Unit"
              value={unit} 
              onChange={(e: any) => {setUnit(e.target.value)}} 
              width="100%"
          />
          <br />
          <label htmlFor="">Templates</label><br />
          <div 
              className="templateInputContainer" 
              style={{ display: "flex", flexWrap: "wrap", gap: "8px", border: "1px solid var(--border)", padding: "4px", minHeight: "34px", borderRadius: "5px"}}
          >
              {selectedTemplates.map((template, index) => (
              <span 
                  key={index} 
                  style={{ backgroundColor: "var(--primary)", padding: "2px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px", color: "white" }}
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
                  placeholder={selectedTemplates.length === 0 ? "Type and press Enter..." : ""}
                  style={{ border: "none", outline: "none", flexGrow: 1, minWidth: "100px", padding: "5px", background: 'transparent' }}
              />
          </div>
          <br />
          
          <div style={{ position: 'relative', display: 'block', marginBottom: '20px' }}>
    
    <div style={{ marginBottom: '5px' }}>{"Item Photo"}</div>
    
    {/* 2. Visual Button */}
    <div className="ui-button" style={{ 
        width: '100%', 
        padding: '10px', 
        border: '1px solid var(--border)', 
        borderRadius: '4px', 
        backgroundColor: 'rgba(255,255,255,0.05)',
        fontSize: '14px',
        color: 'var(--primary)',
        textAlign: 'left',
    }}>
        <i className="icons10-camera" style={{ marginRight: '10px' }}></i>
        {inputMessage}
    </div>

    {/* 3. The actual file input */}
    <input 
    type="file" 
    ref={fileInputRef}
    onChange={handleFileChange} 
    onClick={(e) => e.stopPropagation()}       // <-- THE SHIELD
    onMouseDown={(e) => e.stopPropagation()}   // <-- THE SHIELD
    style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        backgroundColor: 'red',
        cursor: 'pointer',
        zIndex: 999
    }} 
/>
</div>
          
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
    </>
  );
}