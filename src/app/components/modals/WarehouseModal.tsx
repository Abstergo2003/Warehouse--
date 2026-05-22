"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import dynamic from "next/dynamic";
import { CreateWarehouseAction, UpdateWarehouseAction } from "@/lib/actions/createWarehouse";
import { Dialog, InputText, LoaderBusy, Button } from "react-windows-ui";
import { getStorageInfoQuery } from "@/lib/actions/queries";
import { useSession } from "next-auth/react";

const LocationPicker = dynamic(() => import("@/app/components/LocationPicker"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function WarehouseEditModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const editId = searchParams.get("editId");
  const isEdit = !!editId;

  const [name, setName] = useState("");
  const [area, setArea] = useState(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [inputMessage, setInputMessage] = useState("Upload Photo");
  const [loading, setLoading] = useState(isEdit);

  // 1. Create the ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && session?.user?.id) {
        getStorageInfoQuery(editId!, session.user.id).then(data => {
            if (data) {
                setName(data.name);
                setArea(data.storage_area);
                try {
                    const parsed = typeof data.localization === 'string' ? JSON.parse(data.localization) : data.localization;
                    setCoords(parsed);
                    setInitialCoords(parsed);
                } catch (e) {
                    console.error("Error parsing coords", e);
                }
            }
            setLoading(false);
        });
    }
  }, [isEdit, editId, session?.user?.id]);

  const handleLocationSelect = useCallback((coords: { lat: number; lng: number }) => {
    setCoords(coords);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setInputMessage(file.name);
      }
  };

  // 2. Explicitly trigger the hidden input
  const handlePhotoClick = () => {
    console.log("test");
    fileInputRef.current?.click();
  };

  const handleManualSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("area", area.toString());
    formData.append("coords", JSON.stringify(coords));
    
    // 3. Read the file directly from the ref instead of getElementById
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    if (isEdit) {
        await UpdateWarehouseAction(formData, editId!);
    } else {
        await CreateWarehouseAction(formData);
    }
    close();
  };

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("editId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog isVisible={true} onBackdropPress={close}>
        <div style={{padding: "20px", width: "450px"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h3>{isEdit ? "Edit Warehouse" : "Create Warehouse"}</h3>
                <span style={{cursor: "pointer", fontWeight: "bold"}} onClick={close}>X</span>
            </div>
            <br />
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <LoaderBusy isLoading={true} size="default" />
                </div>
            ) : (
                <>
                    <InputText 
                        label="Name"
                        value={name} 
                        onChange={(e: any)=>{setName(e.target.value)}} 
                        width="100%"
                    />
                    <br />
                    <label>Area (m<sup>2</sup>)</label><br />
                    <input 
                        type="number" 
                        value={area}
                        onChange={(e)=>{setArea(e.target.valueAsNumber)}} 
                        style={{width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px"}}
                    /><br />
                    <br />
                    <label style={{ display: 'block', marginBottom: '10px' }}>Warehouse Location</label>
                    <div style={{height: "250px", border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden'}}>
                        <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={initialCoords} />
                    </div>
                    <br />
                    
                    {/* 4. Removed <label> wrapper. Added onClick to the button div */}
                    <div style={{ display: 'block', marginBottom: '20px' }}>
                        {/* 1. MUST BE position: relative */}
<div style={{ position: 'relative', display: 'block', marginBottom: '20px' }}>
    
    <div style={{ marginBottom: '5px' }}>{isEdit ? "Change Photo (optional)" : "Warehouse Photo"}</div>
    
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
                    </div>

                    <br />
                    <button 
                        onClick={handleManualSubmit}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: 'var(--primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}
                    >
                        {isEdit ? "Save Changes" : "Create Warehouse"}
                    </button>
                </>
            )}
        </div>
    </Dialog>
  );
}