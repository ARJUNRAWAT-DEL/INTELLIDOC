// API Types matching the enhanced backend

// Base interfaces first
export interface Chunk {
  id: number;
  text: string;
  doc_id: number;
}

export interface Source {
  doc_id: number;
  doc_title: string;
}

// Document interfaces
export interface DocumentSummary {
  id: number;
  title: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks_count: number | null;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks: Chunk[];
}

// Search interfaces
export interface SearchResponse {
  query: string;
  answer: string;
  sources: Source[];
  processing_time?: number;
}

// Upload interfaces
export interface UploadResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface TaskStatus {
  task_id: string;
  status: string; // "processing", "completed", "failed"
  progress: number; // 0-100
  message: string;
  result?: {
    document_id: number;
    title: string;
    chunks_count: number;
    file_size: number;
    file_type: string;
  };
}

// System interfaces
export interface HealthCheck {
  status: string;
  database: string;
  models: Record<string, any>;
  timestamp: string;
}

export interface Metrics {
  documents_count: number;
  chunks_count: number;
  avg_chunks_per_doc: number;
  total_file_size: number;
  model_info: Record<string, any>;
}
