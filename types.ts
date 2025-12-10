export enum Area {
  COPYS = 'COPYS',
  DIRECTORES = 'DIRECTORES',
  AUDIOVISUAL = 'AUDIOVISUAL',
  GRAFICOS = 'GRAFICOS',
  DIGITAL_WEB = 'DIGITAL WEB',
  CUENTAS = 'CUENTAS',
  COMERCIAL = 'COMERCIAL',
  GERENCIA = 'GERENCIA',
  TALENTO_HUMANO = 'TALENTO HUMANO',
  ADMINISTRATIVA = 'ADMINISTRATIVA',
  PR = 'PR',
  SERVICIOS_GENERALES = 'SERVICIOS GENERALES'
}

export enum Peticion {
  REPOSICION = 'REPOSICIÓN',
  DIA_FAMILIA = 'DIA DE LA FAMILIA',
  COMPENSATORIO = 'COMPENSATORIO',
  DIA_NO_REMUNERADO = 'DIA NO REMUNERADO',
  VACACIONES = 'VACACIONES'
}

export interface Solicitud {
  id: string;
  nombre: string;
  area: Area;
  fechaInicio: string; // ISO Date string YYYY-MM-DD
  fechaFin: string;   // ISO Date string YYYY-MM-DD
  tipoPeticion: Peticion;
}

export const PETICION_COLORS: Record<Peticion, string> = {
  [Peticion.REPOSICION]: 'bg-purple-100 text-purple-800 border-purple-200',
  [Peticion.DIA_FAMILIA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [Peticion.COMPENSATORIO]: 'bg-green-100 text-green-800 border-green-200',
  [Peticion.DIA_NO_REMUNERADO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [Peticion.VACACIONES]: 'bg-sky-100 text-sky-800 border-sky-200',
};

export const PETICION_DOT_COLORS: Record<Peticion, string> = {
  [Peticion.REPOSICION]: 'bg-purple-500',
  [Peticion.DIA_FAMILIA]: 'bg-yellow-500',
  [Peticion.COMPENSATORIO]: 'bg-green-500',
  [Peticion.DIA_NO_REMUNERADO]: 'bg-gray-500',
  [Peticion.VACACIONES]: 'bg-sky-500',
};