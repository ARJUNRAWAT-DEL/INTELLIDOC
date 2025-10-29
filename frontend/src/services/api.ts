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

export const API_URL = "http://localhost:8000";

  export class ApiService {
    // -------------------- Auth --------------------
    static setToken(token: string) {
      try {
        localStorage.setItem('intellidoc_token', token);
      } catch (e) {
        console.warn('Failed to store token', e);
      }
    }

    static getToken(): string | null {
      try {
        // prefer sessionStorage (temporary token) then localStorage (remembered)
        const s = sessionStorage.getItem('intellidoc_token');
        if (s) return s;
        return localStorage.getItem('intellidoc_token');
      } catch (e) {
        return null;
      }
    }

    static logout() {
      try {
        localStorage.removeItem('intellidoc_token');
      } catch (e) {
        /* ignore */
      }
    }

    static getAuthHeaders(): Record<string, string> {
      const token = ApiService.getToken();
      if (token) return { Authorization: `Bearer ${token}` };
      return {};
    }

    static async login(credentials: { email: string; password: string }): Promise<{ token?: string; user?: any }> {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.detail || 'Login failed');
        }

        // Return response body to caller; caller decides how to persist token (remember or session)
        const data = await response.json();
        return data;
      } catch (err) {
        // Network / backend not reachable - fallback to dev mock when running locally
        console.warn('Login request failed, falling back to mock:', err);
        if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
          // check local dev users store
          const usersRaw = localStorage.getItem('dev_users');
          const users = usersRaw ? JSON.parse(usersRaw) : {};
          const u = users[credentials.email];
          if (u && u.password === credentials.password) {
            const fake = { token: 'dev-token-' + Math.random().toString(36).slice(2, 9), user: { email: credentials.email, name: u.name || credentials.email } };
            return fake;
          }
          throw new Error('Login failed: user not found (dev)');
        }
        throw err;
      }
    }

    static async register(payload: { email: string; password: string; name?: string }): Promise<{ token?: string; user?: any }> {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.detail || 'Registration failed');
        }

        return response.json();
      } catch (err) {
        console.warn('Register request failed, falling back to mock:', err);
        if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
          // store in dev_users
          const usersRaw = localStorage.getItem('dev_users');
          const users = usersRaw ? JSON.parse(usersRaw) : {};
          if (users[payload.email]) {
            throw new Error('User already exists (dev)');
          }
          users[payload.email] = { name: payload.name || payload.email, password: payload.password };
          localStorage.setItem('dev_users', JSON.stringify(users));
          const fake = { token: 'dev-token-' + Math.random().toString(36).slice(2, 9), user: { email: payload.email, name: payload.name || payload.email } };
          return fake;
        }
        throw err;
      }
    }

    static getOauthUrl(provider: 'google' | 'github', redirectUri?: string) {
      const base = `${API_URL}/auth/${provider}`;
      if (!redirectUri) return base;
      return `${base}?redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    static async getOauthConfig(): Promise<{ google: boolean; github: boolean }> {
      try {
        const res = await fetch(`${API_URL}/auth/config`);
        if (!res.ok) return { google: false, github: false };
        return await res.json();
      } catch (e) {
        return { google: false, github: false };
      }
    }

    // -------------------- Forgot/Reset Password --------------------
    static async forgotPassword(email: string): Promise<{ ok: boolean; message?: string; reset_link?: string }> {
      try {
        const res = await fetch(`${API_URL}/auth/forgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to request password reset');
        }
        return await res.json();
      } catch (e) {
        throw e;
      }
    }

    static async resetPassword(token: string, password: string): Promise<{ ok: boolean; message?: string; email?: string }> {
      try {
        const res = await fetch(`${API_URL}/auth/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to reset password');
        }
        return await res.json();
      } catch (e) {
        throw e;
      }
    }

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

    // -------------------- Book demo --------------------
    static async bookDemo(payload: { name?: string; email: string; company?: string; message?: string }): Promise<any> {
      const response = await fetch(`${API_URL}/book-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create demo request');
      }

      return response.json();
    }

    // -------------------- Onboarding --------------------
    static async saveOnboarding(payload: { user_email: string; persona?: string; sample_query?: string; upload_filename?: string; upload_task_id?: string; completed?: boolean; meta?: any }): Promise<any> {
      const response = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to save onboarding');
      }

      return response.json();
    }

    static async getOnboarding(email: string): Promise<any> {
      const url = new URL(`${API_URL}/onboarding`);
      url.searchParams.set('email', email);
      const response = await fetch(url.toString());
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to get onboarding');
      }
      return response.json();
    }
  }