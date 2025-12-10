import React, { useState, useEffect } from 'react';
import { Solicitud, Area, Peticion } from './types';
import SolicitudForm from './components/SolicitudForm';
import CalendarView from './components/CalendarView';
import GeminiAssistant from './components/GeminiAssistant';
import { requestNotificationPermission, checkAndNotifyUpcoming } from './services/notificationService';
import { LayoutDashboard, Trash2, Bell, BellOff, CalendarRange, PlusSquare, Download, Upload, Save, FolderDown, FolderUp, FileSpreadsheet } from 'lucide-react';
import { testFirestore } from "./services/firestore"
import { 
  obtenerSolicitudes, 
  crearSolicitud, 
  eliminarSolicitud, 
  actualizarSolicitud 
} from "./services/solicitudesService"; 



// Helper to parse CSV lines respecting quotes
const parseCSVLine = (text: string) => {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
};

const App: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => {
    try {
      const saved = localStorage.getItem('solicitudes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading data", e);
      return [];
    }
  });
  
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [activeTab, setActiveTab] = useState<'registro' | 'calendario'>('registro');
  const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);

  // Persist data whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
      checkAndNotifyUpcoming(solicitudes);
    } catch (e) {
      console.error("Error saving data to localStorage", e);
      alert("Atención: No se pudo guardar automáticamente en el navegador. Por favor usa la opción de 'Descargar Copia' para asegurar tus datos.");
    }
  }, [solicitudes]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
  testFirestore();
}, []);

// Cargar datos reales de Firestore al iniciar
useEffect(() => {
    const cargar = async () => {
      const datos = await obtenerSolicitudes();
      setSolicitudes(datos);
    };
    cargar();
  }, []);

  const handleSubmit = async (data: Omit<Solicitud, "id">) => {
    const id = await crearSolicitud(data);
    setSolicitudes(prev => [
      ...prev,
      { id, ...data }
    ]);
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      checkAndNotifyUpcoming(solicitudes);
    }
  };

  const handleSaveSolicitud = async (data: Omit<Solicitud, 'id'>) => {
    if (editingSolicitud) {
      await actualizarSolicitud(editingSolicitud.id, data);

      setSolicitudes(prev =>
        prev.map(s => 
          s.id === editingSolicitud.id ? { id: s.id, ...data } : s
        )
      );

      setEditingSolicitud(null);
    } else {
      const id = await crearSolicitud(data);
      setSolicitudes(prev => [...prev, { id, ...data }]);
    }

    setActiveTab('calendario');
};


  const handleEditRequest = (solicitud: Solicitud) => {
    setEditingSolicitud(solicitud);
    setActiveTab('registro');
  };

const handleDeleteRequest = async (id: string) => {
  if (!confirm("¿Eliminar este registro?")) return;

  await eliminarSolicitud(id);

  setSolicitudes(prev => prev.filter(s => s.id !== id));

  if (editingSolicitud?.id === id) {
    setEditingSolicitud(null);
  }
};

  const handleCancelEdit = () => {
    setEditingSolicitud(null);
  };

  const handleClearData = () => {
    if (confirm('⚠️ ¡PELIGRO! ⚠️\n\n¿Estás seguro de que deseas BORRAR TODOS los datos?\n\nEsta acción no se puede deshacer a menos que tengas una copia de seguridad descargada.')) {
      setSolicitudes([]);
      localStorage.removeItem('sent_notifications_log');
      setEditingSolicitud(null);
    }
  };

  // Backup Features
  const handleExportData = () => {
    const dataStr = JSON.stringify(solicitudes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `RESPALDO-CALENDARIO-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to CSV for Google Sheets / Excel
  const handleExportCSV = () => {
    if (solicitudes.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = ['Nombre', 'Área', 'Tipo de Petición', 'Fecha Inicio', 'Fecha Fin'];
    // Add BOM for correct UTF-8 display in Excel
    const csvContent = [
      headers.join(','),
      ...solicitudes.map(s => [
        `"${s.nombre.replace(/"/g, '""')}"`, // Escape quotes
        `"${s.area}"`,
        `"${s.tipoPeticion}"`,
        s.fechaInicio,
        s.fechaFin
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `REPORTE-GESTION-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let content = e.target?.result as string;
        // Remove Byte Order Mark if present (common in UTF-8 CSVs)
        content = content.replace(/^\uFEFF/, '');
        
        let newSolicitudes: Solicitud[] = [];

        // Simple detection logic: If it starts with [ or { it's likely JSON.
        // Otherwise, assume CSV.
        const isJson = content.trim().startsWith('[') || file.name.endsWith('.json');

        if (isJson) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            newSolicitudes = parsed;
          } else {
             throw new Error("Formato JSON inválido");
          }
        } else {
          // CSV Parsing Logic
          const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
          if (lines.length === 0) throw new Error("Archivo CSV vacío");

          // Check for headers (optional, but skip if first row looks like header)
          const startIndex = (lines[0].toLowerCase().includes('nombre') || lines[0].toLowerCase().includes('area')) ? 1 : 0;

          for (let i = startIndex; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            // Expecting at least 5 columns: Nombre, Area, Peticion, Inicio, Fin
            if (row.length >= 5) {
               newSolicitudes.push({
                 id: crypto.randomUUID(),
                 nombre: row[0],
                 area: row[1] as Area, // Best effort cast
                 tipoPeticion: row[2] as Peticion, // Best effort cast
                 fechaInicio: row[3], // Assumes YYYY-MM-DD or standard date format
                 fechaFin: row[4]
               });
            }
          }
        }

        if (newSolicitudes.length > 0) {
          if (confirm(`Se han detectado ${newSolicitudes.length} registros.\n\n¿Deseas reemplazar tu calendario actual con estos datos?`)) {
              setSolicitudes(newSolicitudes);
              alert("✅ ¡Datos importados exitosamente! Visualizando calendario...");
              setActiveTab('calendario');
          }
        } else {
          alert("⚠️ No se encontraron registros válidos en el archivo.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Error al leer el archivo. Asegúrate de que sea un JSON de respaldo o un CSV con el formato correcto.");
      }
    };
    reader.readAsText(file);
    // Reset input value to allow selecting the same file again if needed
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform rotate-3">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">
              Gestor<span className="text-primary">Plan</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Action Bar for Data Safety */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2 border border-slate-200">
               <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white rounded-md transition-all"
                title="Descargar en formato compatible con Google Sheets y Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden md:inline">Exportar a Sheets</span>
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
               <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                title="Descargar una copia de seguridad a tu PC (JSON)"
              >
                <FolderDown className="w-4 h-4" />
                <span className="hidden md:inline">Respaldo JSON</span>
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-all cursor-pointer">
                <FolderUp className="w-4 h-4" />
                <span className="hidden md:inline">Restaurar</span>
                <input type="file" accept=".json,.csv" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <button 
              onClick={handleEnableNotifications}
              className={`p-2 rounded-full transition-all relative ${
                notifPermission === 'granted' 
                  ? 'text-primary bg-blue-50 hover:bg-blue-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={notifPermission === 'granted' ? 'Notificaciones activas' : 'Activar notificaciones'}
            >
              {notifPermission === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
            
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <button 
              onClick={handleClearData}
              className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 rounded-lg"
              title="Borrar todos los datos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'registro' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PlusSquare className="w-4 h-4" />
            {editingSolicitud ? 'Editar Registro' : 'Registrar Datos'}
          </button>
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'calendario' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Ver Calendario
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Tab 1: Formulario de Registro / Edición */}
        {activeTab === 'registro' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {editingSolicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
              </h2>
              <p className="text-slate-500">
                {editingSolicitud 
                  ? 'Modifica los datos y guarda los cambios.' 
                  : 'Completa la información requerida para registrar el evento en el calendario.'}
              </p>
            </div>
            <SolicitudForm 
              onSubmit={handleSaveSolicitud} 
              initialData={editingSolicitud || undefined}
              onCancel={editingSolicitud ? handleCancelEdit : undefined}
            />
          </div>
        )}

        {/* Tab 2: Calendario */}
        {activeTab === 'calendario' && (
          <div className="h-[750px] animate-in fade-in zoom-in-95 duration-300">
             <CalendarView 
               solicitudes={solicitudes} 
               onEdit={handleEditRequest}
               onDelete={handleDeleteRequest}
             />
          </div>
        )}

      </main>

      {/* Gemini Assistant available globally */}
      <GeminiAssistant solicitudes={solicitudes} />
    </div>
  );
};

export default App;