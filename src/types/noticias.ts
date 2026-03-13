export type NoticiaSlim = {
  id: string;
  slug: string;
  titulo: string;
  bajada: string | null;
  categoria: string | null;
  written_at: string | null;
  foto: string | null;
  foto_2?: string | null;
  foto_3?: string | null;
  video: string | null;
  medio: string | null;
  badge?: string | null;
  ciudad?: string | null;
  views?: number | null;
  likes?: number | null;
  written_at_date?: Date | string | null;
};

