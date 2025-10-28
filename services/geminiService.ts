
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedStoreData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      storeName: { 
        type: Type.STRING,
        description: "The name of the store (e.g., AEROPORT, CONFLUENCE)."
      },
      weekStartDate: { 
        type: Type.STRING, 
        description: "The date of the first day of the week in YYYY-MM-DD format." 
      },
      dailyData: {
        type: Type.ARRAY,
        description: "An array of 7 objects, one for each day of the week.",
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: 'The specific date in YYYY-MM-DD format.' },
            revenue: { type: Type.NUMBER, description: "The value for 'Chiffre d'affaires HT' for that day." },
            costs: { type: Type.NUMBER, description: "The value for 'MS chargée' for that day." }
          },
          required: ['date', 'revenue', 'costs']
        }
      },
      weeklyTotal: {
        type: Type.OBJECT,
        description: "The total values for the week.",
        properties: {
          revenue: { type: Type.NUMBER, description: "The total 'Chiffre d'affaires HT'." },
          costs: { type: Type.NUMBER, description: "The total 'MS chargée'." }
        },
        required: ['revenue', 'costs']
      }
    },
    required: ['storeName', 'weekStartDate', 'dailyData', 'weeklyTotal']
  }
};

const prompt = `
You are an expert data extraction assistant. Your task is to analyze the provided images from the 'Skello' business management tool and extract specific performance indicators.

The images show a weekly performance report for different stores. For each image, please extract the following information from the 'Réalisé' (Actual) data view:
1.  The name of the store (e.g., AEROPORT, CONFLUENCE).
2.  The full date for each of the 7 days of the week. The year is visible in the date range selector at the top.
3.  The daily values for "Chiffre d'affaires HT" (revenue).
4.  The daily values for "MS chargée" (salary costs).
5.  The 'Total' column values for both "Chiffre d'affaires HT" and "MS chargée".

Please provide the extracted data in a single JSON array that conforms to the provided schema. Each object in the array should represent one store from one image.

Important Rules:
- Extract data ONLY from the "Réalisé" (Actual) section, not "Prévisionnel" (Forecast).
- Parse numbers with spaces as thousand separators (e.g., '1 910.26 €') into floating-point numbers (e.g., 1910.26).
- The currency is Euro (€), but you should only return the numeric value.
- Format all dates as 'YYYY-MM-DD'. French month names are used (e.g., janv., févr., mars, avr., mai, juin, juil., août, sept., oct., nov., déc.).
- Ensure there are exactly 7 items in the 'dailyData' array, one for each day of the week shown.
`;

export const extractDataFromImages = async (images: { mimeType: string; data: string }[]): Promise<ExtractedStoreData[]> => {
  if (!images.length) {
    return [];
  }

  const imageParts = images.map(image => ({
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  }));
  
  const contents = {
    parts: [
      { text: prompt },
      ...imageParts,
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    // It's already an object because of responseSchema
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to extract data: ${error.message}`);
    }
    throw new Error('An unknown error occurred during data extraction.');
  }
};
