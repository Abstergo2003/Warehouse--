"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CreateWarehouseAction } from "@/lib/actions/createWarehouse";


const LocationPicker = dynamic(() => import("@/app/components/LocationPicker"), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>,
});

export default function WarehouseEditModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [area, setArea] = useState(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [inputMessage, setInputMessage] = useState("Prześlij Zdjęcie");
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    console.log("Wybrano:", coords);
    setCoords(coords);
  };

  const handlePickClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setInputMessage(file.name);
      }
  };

  const handleManualSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("area", area.toString());
    formData.append("coords", JSON.stringify(coords));
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    await CreateWarehouseAction(formData);
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
      <h3>Create Warehouse</h3>
      <br />
      <br />
      <label htmlFor="createItemName">Name:</label><br />
      <input id="createItemName" type="text" onChange={(e)=>{setName(e.target.value)}}/><br />
      <br />
      <label htmlFor="createItemName">Area (m<sup>2</sup>):</label><br />
      <input id="createItemName" type="number" onChange={(e)=>{setArea(e.target.valueAsNumber)}}/><br />
      <br />
      <label className="block text-sm font-medium mb-1">Lokalizacja Magazynu</label>
      <LocationPicker onLocationSelect={handleLocationSelect} />
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