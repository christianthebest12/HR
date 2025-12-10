import React, { useState, useRef, useEffect } from 'react';
import { Solicitud } from '../types';
import { analyzeScheduleWithGemini } from '../services/geminiService';
import { Sparkles, Send, X, Loader2, BrainCircuit } from 'lucide-react';

interface GeminiAssistantProps {
  solicitudes: Solicitud[];
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ solicitudes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleAnalyze = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);
    try {
      const result = await analyzeScheduleWithGemini(solicitudes, query);
      setResponse(result);
    } catch (err) {
      setResponse("Lo siento, hubo un error al procesar tu solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-gradient-to-r from-indigo-500 to-purple-600'
        }`}
      >
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Consultar IA
        </span>
      </button>

      {/* Assistant Modal/Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 text-indigo-700">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-bold">Asistente Inteligente</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/50 rounded-full transition-colors text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {solicitudes.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <p>Agrega algunas solicitudes primero para que pueda analizarlas.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {!response && !isLoading && (
                    <div className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <p className="font-semibold mb-2">¡Hola! Soy tu asistente de programación.</p>
                      <p>Uso modelos de razonamiento avanzado (Gemini 2.5 Pro) para analizar el calendario.</p>
                      <p className="mt-2 text-slate-500">Prueba preguntando:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-slate-500">
                        <li>"¿Hay conflictos en el área de Gráficos la próxima semana?"</li>
                        <li>"¿Quién estará de vacaciones en Navidad?"</li>
                        <li>"Resumen de días libres por área en Octubre"</li>
                      </ul>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-xs text-indigo-500 font-medium animate-pulse">Pensando profundamente...</p>
                    </div>
                  )}

                  {response && (
                    <div ref={responseRef} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm text-slate-700 text-sm leading-relaxed prose prose-indigo max-w-none">
                       {/* Basic Markdown rendering for lines and lists */}
                       {response.split('\n').map((line, i) => (
                         <p key={i} className="mb-2 last:mb-0">
                           {line}
                         </p>
                       ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Escribe tu pregunta sobre el calendario..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={solicitudes.length === 0 || isLoading}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!query.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GeminiAssistant;