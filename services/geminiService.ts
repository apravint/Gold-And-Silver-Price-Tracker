import { GoogleGenAI, Type } from "@google/genai";
import { CommodityPrice } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const priceSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            metal: {
                type: Type.STRING,
                description: "The name of the metal, either 'Gold' or 'Silver'.",
                enum: ['Gold', 'Silver'],
            },
            price: {
                type: Type.NUMBER,
                description: "The current price of the metal.",
            },
            currency: {
                type: Type.STRING,
                description: "The currency code, e.g., 'USD', 'EUR', 'JPY'.",
            },
            unit: {
                type: Type.STRING,
                description: "The unit of measurement, e.g., 'per troy ounce'.",
            },
            change: {
                type: Type.NUMBER,
                description: "The percentage change for the day. Positive for increase, negative for decrease.",
            },
        },
        required: ["metal", "price", "currency", "unit", "change"],
    },
};

export const fetchPrices = async (): Promise<CommodityPrice[]> => {
    try {
        const userLocale = navigator.language || 'en-US';

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the user locale "${userLocale}", determine their local currency. Then, provide the current market prices for Gold and Silver in that local currency. For example, for 'de-DE', use EUR. For 'ja-JP', use JPY. If you cannot determine the currency, default to USD. The response must be a JSON array with objects containing: price, currency code, unit ('per troy ounce'), metal name ('Gold' or 'Silver'), and the percentage change for the day.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: priceSchema,
            },
        });

        const jsonText = response.text.trim();
        const prices: CommodityPrice[] = JSON.parse(jsonText);
        
        // Ensure the order is Gold then Silver for consistent display
        prices.sort((a, b) => {
            if (a.metal === 'Gold') return -1;
            if (b.metal === 'Gold') return 1;
            return 0;
        });

        return prices;
    } catch (error) {
        console.error("Error fetching prices from Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        
        if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("API quota exceeded. Please wait a moment before trying again.");
        }

        throw new Error("Failed to fetch latest precious metals prices. Please try again later.");
    }
};