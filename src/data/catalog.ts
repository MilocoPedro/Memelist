import { CategoryKey } from '../types';

export interface CatalogItem {
  name: string;
  category: CategoryKey;
  unit: string;
}

export const CATALOG: CatalogItem[] = [
  // Frutas y Verduras
  { name: "Plátanos", category: "Frutas y Verduras", unit: "kg" },
  { name: "Manzanas", category: "Frutas y Verduras", unit: "kg" },
  { name: "Tomates de ensalada", category: "Frutas y Verduras", unit: "kg" },
  { name: "Patatas", category: "Frutas y Verduras", unit: "kg" },
  { name: "Cebollas", category: "Frutas y Verduras", unit: "kg" },
  { name: "Zanahorias", category: "Frutas y Verduras", unit: "kg" },
  { name: "Lechuga", category: "Frutas y Verduras", unit: "uds" },
  { name: "Aguacates", category: "Frutas y Verduras", unit: "uds" },
  { name: "Limones", category: "Frutas y Verduras", unit: "kg" },
  { name: "Pimientos verde/rojo", category: "Frutas y Verduras", unit: "kg" },
  { name: "Ajos", category: "Frutas y Verduras", unit: "uds" },
  { name: "Fresas", category: "Frutas y Verduras", unit: "g" },
  { name: "Naranjas", category: "Frutas y Verduras", unit: "kg" },
  { name: "Calabacín", category: "Frutas y Verduras", unit: "uds" },
  { name: "Brócoli", category: "Frutas y Verduras", unit: "uds" },

  // Lácteos y Huevos
  { name: "Leche entera", category: "Lácteos y Huevos", unit: "l" },
  { name: "Leche semidesnatada", category: "Lácteos y Huevos", unit: "l" },
  { name: "Huevos", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Yogures naturales", category: "Lácteos y Huevos", unit: "pack" },
  { name: "Queso rallado", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Queso en lonchas", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Mantequilla", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Nata para cocinar", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Queso fresco", category: "Lácteos y Huevos", unit: "uds" },
  { name: "Yogures de sabores", category: "Lácteos y Huevos", unit: "pack" },

  // Panadería y Pastelería
  { name: "Pan de molde", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Barra de pan", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Picos / Colines", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Croissants", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Galletas María", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Magdalenas", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Base de pizza", category: "Panadería y Pastelería", unit: "uds" },
  { name: "Pan de hamburguesa", category: "Panadería y Pastelería", unit: "pack" },

  // Carnes y Aves
  { name: "Pechuga de pollo", category: "Carnes y Aves", unit: "kg" },
  { name: "Carne picada mixta", category: "Carnes y Aves", unit: "kg" },
  { name: "Filetes de lomo de cerdo", category: "Carnes y Aves", unit: "kg" },
  { name: "Salchichas de pavo", category: "Carnes y Aves", unit: "pack" },
  { name: "Jamón york lonchas", category: "Carnes y Aves", unit: "uds" },
  { name: "Chorizo dulce/picante", category: "Carnes y Aves", unit: "uds" },
  { name: "Jamón serrano lonchas", category: "Carnes y Aves", unit: "uds" },
  { name: "Pechuga de pavo", category: "Carnes y Aves", unit: "kg" },
  { name: "Hamburguesas de vacuno", category: "Carnes y Aves", unit: "pack" },

  // Pescados y Mariscos
  { name: "Filetes de merluza", category: "Pescados y Mariscos", unit: "kg" },
  { name: "Salmón fresco", category: "Pescados y Mariscos", unit: "kg" },
  { name: "Langostinos", category: "Pescados y Mariscos", unit: "kg" },
  { name: "Atún en lata aceite vegetal", category: "Pescados y Mariscos", unit: "pack" },
  { name: "Palitos de cangrejo (Surimi)", category: "Pescados y Mariscos", unit: "uds" },
  { name: "Sardinas en conserva", category: "Pescados y Mariscos", unit: "uds" },

  // Congelados
  { name: "Guisantes congelados", category: "Congelados", unit: "kg" },
  { name: "Pizzas congeladas", category: "Congelados", unit: "uds" },
  { name: "Croquetas de jamón", category: "Congelados", unit: "pack" },
  { name: "Helado de vainilla/chocolate", category: "Congelados", unit: "uds" },
  { name: "Patatas fritas congeladas", category: "Congelados", unit: "kg" },
  { name: "Menestra de verduras", category: "Congelados", unit: "kg" },

  // Bebidas y Refrescos
  { name: "Agua mineral embotellada", category: "Bebidas y Refrescos", unit: "pack" },
  { name: "Refresco Coca-Cola", category: "Bebidas y Refrescos", unit: "pack" },
  { name: "Refresco Fanta de Naranja", category: "Bebidas y Refrescos", unit: "pack" },
  { name: "Zumo de naranja brick", category: "Bebidas y Refrescos", unit: "l" },
  { name: "Cerveza pilsen lata", category: "Bebidas y Refrescos", unit: "pack" },
  { name: "Café molido natural", category: "Bebidas y Refrescos", unit: "uds" },
  { name: "Cápsulas de café", category: "Bebidas y Refrescos", unit: "pack" },
  { name: "Té verde / Infusiones", category: "Bebidas y Refrescos", unit: "uds" },
  { name: "Leche de avena", category: "Bebidas y Refrescos", unit: "l" },

  // Cereales, Legumbres y Pastas
  { name: "Arroz redondo", category: "Cereales, Legumbres y Pastas", unit: "kg" },
  { name: "Espaguetis", category: "Cereales, Legumbres y Pastas", unit: "kg" },
  { name: "Macarrones", category: "Cereales, Legumbres y Pastas", unit: "kg" },
  { name: "Garbanzos cocidos bote", category: "Cereales, Legumbres y Pastas", unit: "uds" },
  { name: "Lentejas secas", category: "Cereales, Legumbres y Pastas", unit: "kg" },
  { name: "Harina de trigo", category: "Cereales, Legumbres y Pastas", unit: "kg" },
  { name: "Copos de avena", category: "Cereales, Legumbres y Pastas", unit: "g" },
  { name: "Cereales de desayuno", category: "Cereales, Legumbres y Pastas", unit: "uds" },

  // Despensa y Conservas
  { name: "Aceite de oliva virgen extra", category: "Despensa y Conservas", unit: "l" },
  { name: "Aceite de girasol", category: "Despensa y Conservas", unit: "l" },
  { name: "Sal de cocina fina/gruesa", category: "Despensa y Conservas", unit: "kg" },
  { name: "Azúcar blanco", category: "Despensa y Conservas", unit: "kg" },
  { name: "Tomate frito bote", category: "Despensa y Conservas", unit: "uds" },
  { name: "Salsa Mayonesa", category: "Despensa y Conservas", unit: "uds" },
  { name: "Aceitunas rellenas de anchoa", category: "Despensa y Conservas", unit: "pack" },
  { name: "Vinagre de vino/módena", category: "Despensa y Conservas", unit: "l" },
  { name: "Ketchup", category: "Despensa y Conservas", unit: "uds" },

  // Snacks y Dulces
  { name: "Chips patatas fritas bolsa", category: "Snacks y Dulces", unit: "uds" },
  { name: "Chocolate negro 85%", category: "Snacks y Dulces", unit: "uds" },
  { name: "Gominolas bolsas", category: "Snacks y Dulces", unit: "uds" },
  { name: "Nueces peladas", category: "Snacks y Dulces", unit: "g" },
  { name: "Pipas de girasol", category: "Snacks y Dulces", unit: "uds" },

  // Bebés
  { name: "Pañales talla mediana", category: "Bebés", unit: "pack" },
  { name: "Toallitas húmedas de bebé", category: "Bebés", unit: "pack" },
  { name: "Tarritos / Potitos de frutas", category: "Bebés", unit: "uds" },
  { name: "Papilla de cereales", category: "Bebés", unit: "uds" },

  // Mascotas
  { name: "Pienso para perro adulto", category: "Mascotas", unit: "kg" },
  { name: "Comida húmeda gato sobres", category: "Mascotas", unit: "pack" },
  { name: "Arena para gatos", category: "Mascotas", unit: "kg" },

  // Otros
  { name: "Pilas alcalinas AA", category: "Otros", unit: "pack" },
  { name: "Papel de aluminio", category: "Otros", unit: "uds" },
  { name: "Servilletas de papel pack", category: "Otros", unit: "pack" },
  { name: "Papel film transparente", category: "Otros", unit: "uds" }
];
