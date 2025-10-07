// API service functions for the enhanced backend

// Local type definitions to avoid import issues
interface DocumentSummary {
  id: number;
  title: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks_count: number | null;
}

interface Chunk {
  id: number;
  text: string;
  doc_id: number;
}

interface Document {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  created_at: string | null;
  file_size: number | null;
  file_type: string | null;
  chunks: Chunk[];
}

interface Source {
  doc_id: number;
  doc_title: string;
}

interface DualAnswerInfo {
  local_answer: string;
  groq_answer: string;
  selected_source: string;
  selection_reason: string;
  dual_answers_enabled: boolean;
}

interface SearchResponse {
  query: string;
  answer: string;
  sources: Source[];
  processing_time?: number;
  dual_answers?: DualAnswerInfo;
}

interface UploadResponse {
  task_id: string;
  status: string;
  message: string;
}

interface TaskStatus {
  task_id: string;
  status: string;
  progress: number;
  message: string;
  result?: {
    document_id: number;
    title: string;
    chunks_count: number;
    file_size: number;
    file_type: string;
  };
}

interface HealthCheck {
  status: string;
  database: string;
  models: Record<string, any>;
  timestamp: string;
}

interface Metrics {
  documents_count: number;
  chunks_count: number;
  avg_chunks_per_doc: number;
  total_file_size: number;
  model_info: Record<string, any>;
}

const API_URL = "http://localhost:8000";

export class ApiService {
  // -------------------- Upload --------------------
  static async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  }

  static async getUploadStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${API_URL}/upload/status/${taskId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get upload status");
    }

    return response.json();
  }

  // -------------------- Search --------------------
  static async search(
    query: string, 
    limit: number = 10, 
    offset: number = 0, 
    docId?: number
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (docId) {
      params.append("doc_id", docId.toString());
    }

    const response = await fetch(`${API_URL}/search?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Search failed");
    }

    return response.json();
  }

  // -------------------- Documents --------------------
  static async getDocuments(skip: number = 0, limit: number = 100): Promise<DocumentSummary[]> {
    const response = await fetch(`${API_URL}/documents?skip=${skip}&limit=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch documents");
    }

    return response.json();
  }

  static async getDocument(id: number): Promise<Document> {
    const response = await fetch(`${API_URL}/documents/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch document");
    }

    return response.json();
  }

  static async deleteDocument(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete document");
    }
  }

  // -------------------- Health & Metrics --------------------
  static async getHealth(): Promise<HealthCheck> {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  }

  static async getMetrics(): Promise<Metrics> {
    const response = await fetch(`${API_URL}/metrics`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch metrics");
    }

    return response.json();
  }

  // -------------------- Model Management --------------------
  static async getModelInfo(): Promise<Record<string, any>> {
    const response = await fetch(`${API_URL}/models/info`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch model info");
    }

    return response.json();
  }

  static async clearModelCache(): Promise<void> {
    const response = await fetch(`${API_URL}/models/clear-cache`, {
      method: "POST",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to clear model cache");
    }
  }
}