import { GoogleGenAI } from "@google/genai";
import { Solicitud } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
// Note: We create a new instance in the functions to ensure we capture the latest env if it changes (though usually static)
// but following best practices from the prompt, we assume process.env.API_KEY is available.

export const analyzeScheduleWithGemini = async (
  solicitudes: Solicitud[], 
  userQuery: string
): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key no configurada. Por favor verifica tu configuración.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare context data
  const contextData = JSON.stringify(solicitudes.map(s => ({
    nombre: s.nombre,
    area: s.area,
    tipo: s.tipoPeticion,
    inicio: s.fechaInicio,
    fin: s.fechaFin
  })), null, 2);

  const prompt = `
    Actúa como un asistente experto en Recursos Humanos y Gestión de Proyectos.
    Tienes acceso a los siguientes datos de solicitudes de vacaciones y permisos en formato JSON:
    ${contextData}

    Tu tarea es responder a la siguiente pregunta o instrucción del usuario basándote EXCLUSIVAMENTE en estos datos.
    
    Usuario: "${userQuery}"

    Si el usuario pregunta por conflictos, disponibilidad o estadísticas, utiliza tu capacidad de razonamiento profundo para calcular solapamientos de fechas y distribuciones por área.
    Responde en español de manera profesional, clara y concisa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the Thinking model as requested
      contents: prompt,
      config: {
        thinkingConfig: {
            thinkingBudget: 32768 // Max budget for deep reasoning about schedule conflicts
        },
      }
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Ocurrió un error al consultar a Gemini. Por favor intenta de nuevo.";
  }
};