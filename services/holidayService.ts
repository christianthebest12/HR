import { format } from 'date-fns';

interface Holiday {
  name: string;
}

// Mapa de festivos fijos (Mes-Día)
// Puedes agregar más fechas aquí fácilmente
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'Año Nuevo',
  '05-01': 'Día del Trabajo',
  '07-20': 'Día de la Independencia',
  '08-07': 'Batalla de Boyacá',
  '12-08': 'Inmaculada Concepción',
  '12-25': 'Navidad',
  '12-31': 'Fin de Año',
};

/**
 * Verifica si una fecha dada es un festivo fijo.
 * Retorna el nombre del festivo o null.
 */
export const getHoliday = (date: Date): string | null => {
  const key = format(date, 'MM-dd');
  return FIXED_HOLIDAYS[key] || null;
};
