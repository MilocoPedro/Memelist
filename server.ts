import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Create shared Gemini client utility on the server
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Automatic categorization will fall back to local rules.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const ALLOWED_CATEGORIES = [
  'Frutas y Verduras',
  'Lácteos y Huevos',
  'Panadería y Pastelería',
  'Carnes y Aves',
  'Pescados y Mariscos',
  'Congelados',
  'Bebidas y Refrescos',
  'Cereales, Legumbres y Pastas',
  'Despensa y Conservas',
  'Snacks y Dulces',
  'Bebés',
  'Mascotas',
  'Otros'
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // /api/mercadona/search — movido a /api/mercadona-search.ts (Vercel Serverless Function)
  // API endpoint for automatic product categorization
  app.post('/api/categorize', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
      }

      const client = getAiClient();
      if (!client) {
        // Fallback local categorizer if API key is not configured yet
        const text = name.toLowerCase().trim();
        let guessedCategory = 'Otros';
        let guessedUnit = 'uds';

        if (text.includes('platano') || text.includes('manzana') || text.includes('tomate') || text.includes('lechuga') || text.includes('aguacate') || text.includes('fruta') || text.includes('patata') || text.includes('cebolla') || text.includes('zanahoria') || text.includes('pera') || text.includes('naranja') || text.includes('fresa') || text.includes('limón') || text.includes('plátano') || text.includes('brócoli') || text.includes('pimiento')) {
          guessedCategory = 'Frutas y Verduras';
          guessedUnit = 'kg';
        } else if (text.includes('leche') || text.includes('queso') || text.includes('yogur') || text.includes('mantequilla') || text.includes('huevo') || text.includes('nata') || text.includes('lacteo')) {
          guessedCategory = 'Lácteos y Huevos';
          guessedUnit = 'uds';
        } else if (text.includes('pan') || text.includes('pasteleria') || text.includes('croissant') || text.includes('galleta') || text.includes('rosquilla') || text.includes('magdalena')) {
          guessedCategory = 'Panadería y Pastelería';
          guessedUnit = 'uds';
        } else if (text.includes('pollo') || text.includes('ternera') || text.includes('cerdo') || text.includes('pechuga') || text.includes('carne') || text.includes('salchicha') || text.includes('bistec') || text.includes('hamburguesa') || text.includes('jamón') || text.includes('jamon')) {
          guessedCategory = 'Carnes y Aves';
          guessedUnit = 'kg';
        } else if (text.includes('pescado') || text.includes('merluza') || text.includes('salmón') || text.includes('salmon') || text.includes('atún') || text.includes('atun') || text.includes('gamba') || text.includes('marisco') || text.includes('pulpo')) {
          guessedCategory = 'Pescados y Mariscos';
          guessedUnit = 'kg';
        } else if (text.includes('agua') || text.includes('fanta') || text.includes('coca') || text.includes('zumo') || text.includes('cerveza') || text.includes('vino') || text.includes('refresco') || text.includes('bebida') || text.includes('té') || text.includes('te') || text.includes('cafe') || text.includes('café')) {
          guessedCategory = 'Bebidas y Refrescos';
          if (text.includes('agua') || text.includes('leche') || text.includes('zumo') || text.includes('refresco')) {
            guessedUnit = 'l';
          }
        } else if (text.includes('arroz') || text.includes('pasta') || text.includes('espagueti') || text.includes('macarrones') || text.includes('lenteja') || text.includes('garbanzo') || text.includes('cereal') || text.includes('avena') || text.includes('harina')) {
          guessedCategory = 'Cereales, Legumbres y Pastas';
          guessedUnit = 'uds';
        } else if (text.includes('patata frita') || text.includes('chocolate') || text.includes('chuches') || text.includes('caramelo') || text.includes('snack') || text.includes('papatas') || text.includes('palomitas') || text.includes('bombón') || text.includes('bombon')) {
          guessedCategory = 'Snacks y Dulces';
        } else if (text.includes('perro') || text.includes('gato') || text.includes('pienso') || text.includes('mascota')) {
          guessedCategory = 'Mascotas';
        }

        return res.json({ category: guessedCategory, unit: guessedUnit, source: 'local_fallback' });
      }

      // Query Gemini
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analiza el producto de supermercado o compra "${name}" y clasifícalo en uno de los siguientes grupos además de recomendar una unidad de medida adecuada.`,
        config: {
          systemInstruction: `Eres un asistente experto para Listonic que categoriza productos de listas de compras en español de forma extremadamente precisa.
Debes devolver la clasificación en formato JSON según el siguiente esquema estricto.
El campo 'category' DEBE ser exactamente uno de estos valores: ${JSON.stringify(ALLOWED_CATEGORIES)}.
El campo 'unit' DEBE ser uno de los siguientes valores cortos sugeridos: 'uds' (unidades), 'kg' (kilogramos), 'g' (gramos), 'l' (litros), 'pack' (paquetes), 'm' (metros).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Must match exactly one of the values in the defined categories list.'
              },
              unit: {
                type: Type.STRING,
                description: "Must be exactly 'uds', 'kg', 'g', 'l', 'pack', or 'm'."
              }
            },
            required: ['category', 'unit']
          }
        }
      });

      const text = response.text ? response.text.trim() : '';
      if (!text) {
        throw new Error("No response text from Gemini API");
      }

      const parsed = JSON.parse(text);

      // Validate that the returned category is allowed
      let finalCategory = parsed.category;
      if (!ALLOWED_CATEGORIES.includes(finalCategory)) {
        // Fallback to match close ones or default to 'Otros'
        const matched = ALLOWED_CATEGORIES.find(c => c.toLowerCase() === finalCategory.toLowerCase());
        finalCategory = matched || 'Otros';
      }

      res.json({
        category: finalCategory,
        unit: parsed.unit || 'uds',
        source: 'gemini'
      });

    } catch (error) {
      console.error('Error categorizing product:', error);
      res.status(500).json({ error: 'Fallo al categorizar el producto automáticamente.' });
    }
  });

  // Serve static client files or use Vite dev server as middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
