export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  sharedWith: string[]; // List of user emails
  createdAt: any; // Firestore Timestamp, string or Date
  updatedAt: any; // Firestore Timestamp, string or Date
  isArchived: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number | null;
  checked: boolean;
  createdAt: any; // Firestore Timestamp, string or Date
  updatedAt: any; // Firestore Timestamp, string or Date
  addedBy: string; // The user ID who added this
  addedByName?: string; // The user's name who added this
  imageUrl?: string;
}

export type CategoryKey =
  | 'Frutas y Verduras'
  | 'Lácteos y Huevos'
  | 'Panadería y Pastelería'
  | 'Carnes y Aves'
  | 'Pescados y Mariscos'
  | 'Congelados'
  | 'Bebidas y Refrescos'
  | 'Cereales, Legumbres y Pastas'
  | 'Despensa y Conservas'
  | 'Snacks y Dulces'
  | 'Bebés'
  | 'Mascotas'
  | 'Otros';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  iconName: string;
  color: string; // Tailwind class
  bgLight: string; // Light background Tailwind class
}

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  'Frutas y Verduras': {
    key: 'Frutas y Verduras',
    label: 'Frutas y Verduras',
    iconName: 'Apple',
    color: 'text-pink-600 border-pink-200',
    bgLight: 'bg-pink-50 text-pink-700',
  },
  'Lácteos y Huevos': {
    key: 'Lácteos y Huevos',
    label: 'Lácteos y Huevos',
    iconName: 'Milk',
    color: 'text-blue-500 border-blue-100',
    bgLight: 'bg-blue-50 text-blue-700',
  },
  'Panadería y Pastelería': {
    key: 'Panadería y Pastelería',
    label: 'Panadería y Pastelería',
    iconName: 'Croissant',
    color: 'text-pink-600 border-pink-200',
    bgLight: 'bg-pink-50 text-pink-800',
  },
  'Carnes y Aves': {
    key: 'Carnes y Aves',
    label: 'Carnes y Aves',
    iconName: 'Beef',
    color: 'text-rose-600 border-rose-200',
    bgLight: 'bg-rose-50 text-rose-700',
  },
  'Pescados y Mariscos': {
    key: 'Pescados y Mariscos',
    label: 'Pescados y Mariscos',
    iconName: 'Fish',
    color: 'text-cyan-600 border-cyan-200',
    bgLight: 'bg-cyan-50 text-cyan-700',
  },
  'Congelados': {
    key: 'Congelados',
    label: 'Congelados',
    iconName: 'Snowflake',
    color: 'text-sky-500 border-sky-100',
    bgLight: 'bg-sky-50 text-sky-700',
  },
  'Bebidas y Refrescos': {
    key: 'Bebidas y Refrescos',
    label: 'Bebidas y Refrescos',
    iconName: 'CupSoda',
    color: 'text-purple-600 border-purple-200',
    bgLight: 'bg-purple-50 text-purple-700',
  },
  'Cereales, Legumbres y Pastas': {
    key: 'Cereales, Legumbres y Pastas',
    label: 'Cereales y Pastas',
    iconName: 'Wheat',
    color: 'text-purple-600 border-purple-200',
    bgLight: 'bg-purple-100/50 text-purple-900',
  },
  'Despensa y Conservas': {
    key: 'Despensa y Conservas',
    label: 'Despensa',
    iconName: 'Container',
    color: 'text-purple-705 border-purple-200',
    bgLight: 'bg-purple-100/30 text-purple-800',
  },
  'Snacks y Dulces': {
    key: 'Snacks y Dulces',
    label: 'Snacks y Dulces',
    iconName: 'Cookie',
    color: 'text-pink-500 border-pink-100',
    bgLight: 'bg-pink-50 text-pink-700',
  },
  'Bebés': {
    key: 'Bebés',
    label: 'Bebés',
    iconName: 'Baby',
    color: 'text-teal-500 border-teal-100',
    bgLight: 'bg-teal-50 text-teal-700',
  },
  'Mascotas': {
    key: 'Mascotas',
    label: 'Mascotas',
    iconName: 'Dog',
    color: 'text-pink-700 border-pink-200',
    bgLight: 'bg-pink-100/30 text-pink-900',
  },
  'Otros': {
    key: 'Otros',
    label: 'Otros',
    iconName: 'ShoppingBag',
    color: 'text-slate-500 border-slate-200',
    bgLight: 'bg-slate-50 text-slate-750',
  },
};
