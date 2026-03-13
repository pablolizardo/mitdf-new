export type BarcazaCruce = {
  id: number;
  embarcacion?: string;
  origen?: string;
  destino?: string;
  presentacion?: string; // fecha/hora de presentación
  estado?: string; // código numérico como string (ej. "8")
  estado_detalle?: string; // texto: "Normal", "Suspendido", etc.
  zarpeOriginal?: string;
  nombre_embarcadero?: string;
  [key: string]: unknown;
};

export type BarcazaEstadoSimple = {
  id: number;
  tipo: string;
  estado: string;
  timestamp_suspension: string | null;
  timestamp_reanudacion: string | null;
  observaciones: string | null;
};

export type BarcazaApiResponse = {
  primera_angostura?: BarcazaEstadoSimple[];
  rio_verde?: BarcazaEstadoSimple[];
  info?: {
    estado: string;
    mensaje: string;
    resultados: number;
  };
  data: BarcazaCruce[];
};