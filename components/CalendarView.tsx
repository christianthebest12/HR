import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Solicitud, PETICION_COLORS } from '../types';
import { getHoliday } from '../services/holidayService';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Edit2, Trash2, Clock, User, Briefcase, Tag, PartyPopper } from 'lucide-react';

interface CalendarViewProps {
  solicitudes: Solicitud[];
  onEdit: (solicitud: Solicitud) => void;
  onDelete: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ solicitudes, onEdit, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getSolicitudesForDay = (date: Date) => {
    return solicitudes.filter(s => {
      const start = parseISO(s.fechaInicio);
      const end = parseISO(s.fechaFin);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 overflow-y-auto">
        {days.map((day, idx) => {
          const daySolicitudes = getSolicitudesForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const holidayName = getHoliday(day);

          return (
            <div 
              key={day.toString()} 
              className={`
                min-h-[140px] p-2 border-b border-r border-slate-50 transition-colors hover:bg-slate-50/50 flex flex-col gap-1 relative
                ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'}
                ${holidayName ? 'bg-red-50/10' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-primary text-white shadow-md shadow-primary/30' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                  ${holidayName && !isToday ? 'text-red-500 font-bold' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Holiday Badge */}
              {holidayName && (
                <div className="mb-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-tight truncate border border-red-100 flex items-center gap-1">
                  <PartyPopper className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{holidayName}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 z-10 max-h-[120px]">
                {daySolicitudes.map((solicitud) => (
                  <button 
                    key={`${solicitud.id}-${day.toString()}`}
                    onClick={() => setSelectedSolicitud(solicitud)}
                    className={`
                      text-left w-full text-[10px] px-2 py-1.5 rounded border leading-tight shadow-sm hover:opacity-80 transition-opacity
                      ${PETICION_COLORS[solicitud.tipoPeticion]}
                    `}
                    title="Click para ver detalles, editar o borrar"
                  >
                    <div className="font-bold truncate mb-0.5">{solicitud.nombre}</div>
                    <div className="opacity-90 truncate text-[9px] mb-0.5">{solicitud.tipoPeticion}</div>
                    <div className="opacity-75 truncate text-[9px] italic">{solicitud.area}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedSolicitud && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className={`p-4 ${PETICION_COLORS[selectedSolicitud.tipoPeticion]} border-b-0`}>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg pr-4">{selectedSolicitud.tipoPeticion}</h3>
                <button 
                  onClick={() => setSelectedSolicitud(null)}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                  <p className="text-slate-800 font-medium">{selectedSolicitud.nombre}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Área</label>
                  <p className="text-slate-800 font-medium">{selectedSolicitud.area}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Fechas</label>
                  <p className="text-slate-800 font-medium">
                    {format(parseISO(selectedSolicitud.fechaInicio), "d 'de' MMMM", { locale: es })} - {format(parseISO(selectedSolicitud.fechaFin), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>

               <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Tipo</label>
                  <p className="text-slate-800 font-medium">{selectedSolicitud.tipoPeticion}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => {
                  onDelete(selectedSolicitud.id);
                  setSelectedSolicitud(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Borrar
              </button>
              <button 
                onClick={() => {
                  onEdit(selectedSolicitud);
                  setSelectedSolicitud(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-blue-600 font-semibold transition-colors shadow-md shadow-primary/20 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;