"use client";

import { useSearchParams } from "next/navigation";
// Importuj swoje modale
import ItemEditModal from "./modals/ItemModal";
import WarehouseEditModal from "./modals/WarehouseModal";
import TemplateModal from "./modals/TemplateModal";
import ShareWarehouseModal from "./modals/ShareWarehouseModal";


export default function ModalManager() {
  const searchParams = useSearchParams();
  const modalType = searchParams.get("modal"); // Pobieramy np. "add-item"

  // Mapa: Klucz z URL -> Komponent Reacta
  // To eliminuje długie drabinki "if / else if"
  switch (modalType) {
    case "add-item":
      return <ItemEditModal />;
    case "add-warehouse":
      return <WarehouseEditModal />;
    case "share-warehouse":
      return <ShareWarehouseModal />;
    case "add-template":
      return <TemplateModal />;
    // case "add-item":
    //   return <AddItemModal />;
      

    default:
      return null; // Jeśli nic nie pasuje, nie renderuj nic
  }
}