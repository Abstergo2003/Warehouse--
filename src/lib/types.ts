export interface AnimatedIconProps {
  size?: number,
  color?: string,
  strokeWidth?: number,
  className?: string,
}

export interface Item {
  id: string,
  name: string,
  amount: number,
  unit_of_measurement: string,
  image_url: string,
  added_at: Date,
  is_borrowed: boolean,
  is_damaged: boolean,
  last_borrowed: string,
  owner_id: string,
  storage_id: string,
  min_amount: number,
  data: TemplatesRow[],
  storage_name?: string;
}

export interface AnimatedIconHandle {
  startAnimation: () => void,
  stopAnimation: () => void,
}

export interface Storage {
  id: string,
  name: string,
  localization: string,
  storage_area: number,
  owner_id: string,
  img_url?: string,
  effective_role?: string, // Opcjonalne, bo to pole wyliczane w SQL
}

export interface FieldType {
    name: string,
    type: string,
    defVal: string
}

export interface TemplatesRow {
  name: string,
  id: string,
  user_id: string,
  fields: FieldType[]
}

export interface StorageShare {
  user_id: string;
  display_name: string;
  role: string;
}

export interface ItemHistory {
  id: string;
  item_id: string | null;
  user_id: string;
  action_type: 'borrow' | 'return' | 'create' | 'edit' | 'delete' | 'move';
  notes: string;
  created_at: string | Date;
  display_name?: string;
}