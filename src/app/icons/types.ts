export interface AnimatedIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface Storage {
  id: string;
  name: string;
  localization: string;
  storage_area: number;
  owner_id: string;
  effective_role?: string; // Opcjonalne, bo to pole wyliczane w SQL
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