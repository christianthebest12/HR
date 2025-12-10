import React, { useState, useEffect } from 'react';
import { Area, Peticion, Solicitud } from '../types';
import { Calendar as CalendarIcon, User, Briefcase, Tag, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

interface SolicitudFormProps {
  onSubmit: (solicitud: Omit<Solicitud, 'id'>) => void;
  initialData?: Solicitud;
  onCancel?: () => void;
}

const SolicitudForm: React.FC<SolicitudFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState<Area>(Area.COPYS);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoPeticion, setTipoPeticion] = useState<Peticion>(Peticion.VACACIONES);

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setArea(initialData.area);
      setFechaInicio(initialData.fechaInicio);
      setFechaFin(initialData.fechaFin);
      setTipoPeticion(initialData.tipoPeticion);
    } else {
      // Reset defaults if switching from edit to new
      setNombre('');
      setArea(Area.COPYS);
      setFechaInicio('');
      setFechaFin('');
      setTipoPeticion(Peticion.VACACIONES);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !fechaInicio || !fechaFin) return;

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      alert("La fecha de finalización no puede ser anterior a la de inicio.");
      return;
    }

    onSubmit({
      nombre,
      area,
      fechaInicio,
      fechaFin,
      tipoPeticion
    });

    // Only clear if not editing (if editing, the parent switches tabs usually)
    if (!initialData) {
      setNombre('');
      setFechaInicio('');
      setFechaFin('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
            <User className="w-4 h-4 text-primary" />
            Nombre y Apellido
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 placeholder-slate-400 font-medium"
            placeholder="Escribe tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Área */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <Briefcase className="w-4 h-4 text-primary" />
              Área
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 appearance-none cursor-pointer"
                value={area}
                onChange={(e) => setArea(e.target.value as Area)}
              >
                {Object.values(Area).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Tipo de Petición */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <Tag className="w-4 h-4 text-primary" />
              Petición
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 appearance-none cursor-pointer"
                value={tipoPeticion}
                onChange={(e) => setTipoPeticion(e.target.value as Peticion)}
              >
                {Object.values(Peticion).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Fecha de Inicio
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 cursor-pointer"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Fecha de Finalización
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 cursor-pointer"
              value={fechaFin}
              min={fechaInicio}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 text-lg"
            >
              <XCircle className="w-6 h-6" />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-[2] bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.99] flex items-center justify-center gap-3 text-lg"
          >
            {initialData ? (
              <>
                <RefreshCw className="w-6 h-6" />
                Actualizar Calendario
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Registrar y Ver
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;