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

// Phase 1: Citations
interface Citation {
  quote: string;
  chunk_id: number;
  doc_id: number;
  doc_title: string;
  confidence?: number;
  page_number?: number;
  paragraph_number?: number;
  section_title?: string;
}

interface SearchResponse {
  query: string;
  answer: string;
  sources: Source[];
  processing_time?: number;
  dual_answers?: DualAnswerInfo;
  citations?: Citation[];
  thread_id?: string;
  answer_length?: string;
  answer_mode?: string;
  page_range?: { start?: number | null; end?: number | null };
  document_name?: string;
  generated_at?: string;
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

// Phase 1: Conversation Threading
interface ConversationMessage {
  id: number;
  query: string;
  answer: string;
  sources?: Source[];
  citations?: Citation[];
  created_at?: string;
}

interface ConversationThread {
  id: number;
  thread_id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  messages: ConversationMessage[];
}

// Phase 2: Entity Extraction
interface ExtractedEntity {
  type: string;
  value: string;
  text: string;
  start_char: number;
  end_char: number;
  confidence: number;
}

interface ExtractionResult {
  doc_id: number;
  doc_title: string;
  entities: ExtractedEntity[];
  entities_by_type?: Record<string, ExtractedEntity[]>;
  total_entities?: number;
}

// Phase 3: Document Comparison
interface ComparisonSection {
  category: string;
  content: string;
  referenced_docs: number[];
  evidence?: string[];
}

interface DocumentComparison {
  doc_ids: number[];
  doc_titles: string[];
  common_themes: string[];
  unique_points: Record<string, string[]>;
  similarities: string[];
  differences: string[];
  comparison_summary: string;
  sections: ComparisonSection[];
}

// Phase 4: Translation
interface TranslationResult {
  original_text: string;
  original_language: string;
  target_language: string;
  translated_text: string;
}

interface LanguageDetectionResult {
  detected_language: string;
  language_code: string;
  confidence: number;
}

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Bypass ngrok browser-warning interstitial for all API fetch calls
const _origFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (url.startsWith(API_URL) && API_URL !== "http://localhost:8000") {
    init = init ?? {};
    init.headers = {
      "ngrok-skip-browser-warning": "1",
      ...((init.headers as Record<string, string>) ?? {}),
    };
  }
  return _origFetch(input, init);
};

export class ApiService {
  // -------------------- Helpers --------------------
  static async parseJsonSafe(res: Response) {
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (
      ct.includes("application/json") ||
      ct.includes("application/problem+json") ||
      ct.includes("application/ld+json")
    ) {
      return res.json();
    }
    const text = await res.text();
    // If it's HTML, return text so caller can decide; throw a clear error for callers that expected JSON
    throw new Error(text || `Unexpected response with content-type: ${ct}`);
  }

  // -------------------- Auth --------------------
  static setToken(token: string) {
    try {
      localStorage.setItem("intellidoc_token", token);
    } catch (e) {
      console.warn("Failed to store token", e);
    }
  }

  static getToken(): string | null {
    try {
      const s = sessionStorage.getItem("intellidoc_token");
      if (s) return s;
      return localStorage.getItem("intellidoc_token");
    } catch (e) {
      return null;
    }
  }

  static logout() {
    try {
      localStorage.removeItem("intellidoc_token");
    } catch (e) {
      /* ignore */
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = ApiService.getToken();
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }

  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token?: string; user?: any }> {
    try {
      const normalizedCredentials = {
        ...credentials,
        email: credentials.email.toLowerCase().trim(),
      };
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedCredentials),
      });

      if (!response.ok) {
        try {
          const err = await ApiService.parseJsonSafe(response).catch(
            () => ({}),
          );
          throw new Error(err?.detail || "Login failed");
        } catch (e) {
          throw new Error((e as Error).message || "Login failed");
        }
      }

      return ApiService.parseJsonSafe(response);
    } catch (err) {
      console.warn("Login request failed, falling back to mock:", err);
      if (
        typeof window !== "undefined" &&
        window.location.hostname.includes("localhost")
      ) {
        const usersRaw = localStorage.getItem("dev_users");
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        const emailLower = credentials.email.toLowerCase().trim();
        const u = users[emailLower];
        if (u && u.password === credentials.password) {
          const fake = {
            token: "dev-token-" + Math.random().toString(36).slice(2, 9),
            user: { email: emailLower, name: u.name || emailLower },
          };
          return fake;
        }
        throw new Error("Login failed: user not found (dev)");
      }
      throw err;
    }
  }

  static async register(payload: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ token?: string; user?: any }> {
    try {
      const normalizedPayload = {
        ...payload,
        email: payload.email.toLowerCase().trim(),
      };
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedPayload),
      });

      if (!response.ok) {
        try {
          const err = await ApiService.parseJsonSafe(response).catch(
            () => ({}),
          );
          throw new Error(err?.detail || "Registration failed");
        } catch (e) {
          throw new Error((e as Error).message || "Registration failed");
        }
      }

      return ApiService.parseJsonSafe(response);
    } catch (err) {
      console.warn("Register request failed, falling back to mock:", err);
      if (
        typeof window !== "undefined" &&
        window.location.hostname.includes("localhost")
      ) {
        const usersRaw = localStorage.getItem("dev_users");
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        const emailLower = payload.email.toLowerCase().trim();
        if (users[emailLower]) {
          throw new Error("User already exists (dev)");
        }
        users[emailLower] = {
          name: payload.name || emailLower,
          password: payload.password,
        };
        localStorage.setItem("dev_users", JSON.stringify(users));
        const fake = {
          token: "dev-token-" + Math.random().toString(36).slice(2, 9),
          user: { email: emailLower, name: payload.name || emailLower },
        };
        return fake;
      }
      throw err;
    }
  }

  static async loginWithGoogle(
    token: string,
    name?: string,
  ): Promise<{ token?: string; user?: any }> {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });

      if (!response.ok) {
        try {
          const err = await ApiService.parseJsonSafe(response).catch(
            () => ({}),
          );
          throw new Error(err?.detail || "Google authentication failed");
        } catch (e) {
          throw new Error(
            (e as Error).message || "Google authentication failed",
          );
        }
      }

      return ApiService.parseJsonSafe(response);
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  }

  static async getCurrentUser(email: string): Promise<{ user?: any }> {
    try {
      const response = await fetch(
        `${API_URL}/auth/me?email=${encodeURIComponent(email.toLowerCase().trim())}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email.toLowerCase().trim(),
          },
        },
      );

      if (!response.ok) {
        try {
          const err = await ApiService.parseJsonSafe(response).catch(
            () => ({}),
          );
          throw new Error(err?.detail || "Failed to get user info");
        } catch (e) {
          throw new Error((e as Error).message || "Failed to get user info");
        }
      }

      return ApiService.parseJsonSafe(response);
    } catch (err) {
      console.warn("Get current user failed:", err);
      if (
        typeof window !== "undefined" &&
        window.location.hostname.includes("localhost")
      ) {
        return {
          user: {
            email: email.toLowerCase().trim(),
            name: email.split("@")[0],
            is_admin: email.toLowerCase().trim() === "rawatarjun98@gmail.com",
          },
        };
      }
      throw err;
    }
  }

  static getOauthUrl(provider: "google" | "github", redirectUri?: string) {
    const base = `${API_URL}/auth/${provider}`;
    if (!redirectUri) return base;
    return `${base}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  static async getOauthConfig(): Promise<{ google: boolean; github: boolean }> {
    try {
      const res = await fetch(`${API_URL}/auth/config`);
      if (!res.ok) return { google: false, github: false };
      return await ApiService.parseJsonSafe(res);
    } catch (e) {
      return { google: false, github: false };
    }
  }

  static async forgotPassword(
    email: string,
  ): Promise<{ ok: boolean; message?: string; reset_link?: string }> {
    try {
      const res = await fetch(`${API_URL}/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await ApiService.parseJsonSafe(res).catch(() => ({}));
        throw new Error(err.detail || "Failed to request password reset");
      }
      return await ApiService.parseJsonSafe(res);
    } catch (e) {
      throw e;
    }
  }

  static async resetPassword(
    token: string,
    password: string,
  ): Promise<{ ok: boolean; message?: string; email?: string }> {
    try {
      const res = await fetch(`${API_URL}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const err = await ApiService.parseJsonSafe(res).catch(() => ({}));
        throw new Error(err.detail || "Failed to reset password");
      }
      return await ApiService.parseJsonSafe(res);
    } catch (e) {
      throw e;
    }
  }

  // -------------------- Admin API --------------------
  static async adminGet(endpoint: string): Promise<any> {
    try {
      const userRaw = localStorage.getItem("intellidoc_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const email = user?.email || "unknown";

      const res = await fetch(
        `${API_URL}${endpoint}?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
          },
        },
      );

      if (!res.ok) {
        const err = await ApiService.parseJsonSafe(res).catch(() => ({}));
        throw new Error(err.detail || "Admin API request failed");
      }

      return await ApiService.parseJsonSafe(res);
    } catch (e: any) {
      console.error(`Admin GET ${endpoint} failed:`, e);
      throw e;
    }
  }

  static async adminPost(endpoint: string, data?: any): Promise<any> {
    try {
      const userRaw = localStorage.getItem("intellidoc_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const email = user?.email || "unknown";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": email,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!res.ok) {
        const err = await ApiService.parseJsonSafe(res).catch(() => ({}));
        throw new Error(err.detail || "Admin API request failed");
      }

      return await ApiService.parseJsonSafe(res);
    } catch (e: any) {
      console.error(`Admin POST ${endpoint} failed:`, e);
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
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Upload failed");
    }

    return ApiService.parseJsonSafe(response);
  }

  static async getUploadStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${API_URL}/upload/status/${taskId}`);

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to get upload status");
    }

    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Search --------------------
  static async search(
    query: string,
    limit: number = 10,
    offset: number = 0,
    docId?: number,
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
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Search failed");
    }

    return ApiService.parseJsonSafe(response);
  }

  // Enhanced search with additional options
  static async searchEnhanced(
    options: {
      query: string;
      answerLength: "short" | "balanced" | "detailed";
      answerMode:
        | "summary"
        | "qa"
        | "keypoints"
        | "pageexplanation"
        | "actionitems";
      pageRange: "entire" | "specific" | "range";
      specificPage?: number;
      startPage?: number;
      endPage?: number;
    },
    docId?: number,
  ): Promise<SearchResponse> {
    const response = await fetch(`${API_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...ApiService.getAuthHeaders(),
      },
      body: JSON.stringify({
        document_id: docId,
        question: options.query,
        answer_length: options.answerLength,
        answer_mode: options.answerMode,
        page_range:
          options.pageRange === "specific"
            ? {
                start: options.specificPage ?? 1,
                end: options.specificPage ?? 1,
              }
            : options.pageRange === "range"
              ? { start: options.startPage ?? 1, end: options.endPage ?? 1 }
              : { start: null, end: null },
      }),
    });

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Enhanced search failed");
    }

    const result = await ApiService.parseJsonSafe(response);

    // Add enhanced query to result for display
    result.query = options.query;

    return result;
  }

  static async exportAnswer(
    payload: {
      question: string;
      answer: string;
      document_name?: string;
      answer_length?: string;
      answer_mode?: string;
      page_range?: { start?: number | null; end?: number | null } | null;
      sources?: Source[];
      citations?: Citation[];
      generated_at?: string;
    },
    exportFormat: "pdf" | "docx",
  ): Promise<Blob> {
    const response = await fetch(`${API_URL}/export/answer/${exportFormat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...ApiService.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(err.detail || "Failed to export answer");
    }

    return response.blob();
  }

  // -------------------- Documents --------------------
  static async getDocuments(
    skip: number = 0,
    limit: number = 100,
  ): Promise<DocumentSummary[]> {
    const response = await fetch(
      `${API_URL}/documents?skip=${skip}&limit=${limit}`,
    );

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch documents");
    }

    return ApiService.parseJsonSafe(response);
  }

  static async getDocument(id: number): Promise<Document> {
    const response = await fetch(`${API_URL}/documents/${id}`);

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch document");
    }

    return ApiService.parseJsonSafe(response);
  }

  static async deleteDocument(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to delete document");
    }
  }

  // -------------------- Health & Metrics --------------------
  static async getHealth(): Promise<HealthCheck> {
    const response = await fetch(`${API_URL}/health`);
    return ApiService.parseJsonSafe(response);
  }

  static async getMetrics(): Promise<Metrics> {
    const response = await fetch(`${API_URL}/metrics`);

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch metrics");
    }

    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Model Management --------------------
  static async getModelInfo(): Promise<Record<string, any>> {
    const response = await fetch(`${API_URL}/models/info`);

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch model info");
    }

    return ApiService.parseJsonSafe(response);
  }

  static async clearModelCache(): Promise<void> {
    const response = await fetch(`${API_URL}/models/clear-cache`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(error.detail || "Failed to clear model cache");
    }
  }

  // -------------------- Book demo --------------------
  static async bookDemo(payload: {
    name?: string;
    email: string;
    company?: string;
    message?: string;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/book-demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(err.detail || "Failed to create demo request");
    }

    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Onboarding --------------------
  static async saveOnboarding(payload: {
    user_email: string;
    persona?: string;
    sample_query?: string;
    upload_filename?: string;
    upload_task_id?: string;
    completed?: boolean;
    meta?: any;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(err.detail || "Failed to save onboarding");
    }

    return ApiService.parseJsonSafe(response);
  }

  static async getOnboarding(email: string): Promise<any> {
    const url = new URL(`${API_URL}/onboarding`);
    url.searchParams.set("email", email);
    const response = await fetch(url.toString());
    if (!response.ok) {
      const err = await ApiService.parseJsonSafe(response).catch(() => ({}));
      throw new Error(err.detail || "Failed to get onboarding");
    }
    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Phase 1: Conversation Threading --------------------
  static async createThread(): Promise<{ thread_id: string; id: number }> {
    const response = await fetch(`${API_URL}/conversation/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to create thread");
    return ApiService.parseJsonSafe(response);
  }

  static async getThread(threadId: string): Promise<ConversationThread> {
    const response = await fetch(`${API_URL}/conversation/${threadId}`);
    if (!response.ok) throw new Error("Failed to get thread");
    return ApiService.parseJsonSafe(response);
  }

  static async searchInThread(
    threadId: string,
    query: string,
    limit: number = 10,
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    const response = await fetch(
      `${API_URL}/conversation/${threadId}/search?${params}`,
    );
    if (!response.ok) throw new Error("Failed to search in thread");
    return ApiService.parseJsonSafe(response);
  }

  static async listThreads(): Promise<any[]> {
    const response = await fetch(`${API_URL}/conversation`);
    if (!response.ok) throw new Error("Failed to list threads");
    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Phase 2: Entity Extraction --------------------
  static async extractEntities(docId: number): Promise<ExtractionResult> {
    const response = await fetch(`${API_URL}/extract?doc_id=${docId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to extract entities");
    return ApiService.parseJsonSafe(response);
  }

  static async extractFromMultipleDocs(docIds: number[]): Promise<any> {
    const response = await fetch(`${API_URL}/extract/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_ids: docIds }),
    });
    if (!response.ok) throw new Error("Failed to extract from multiple docs");
    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Phase 3: Document Comparison --------------------
  static async compareDocuments(docIds: number[]): Promise<DocumentComparison> {
    const response = await fetch(`${API_URL}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_ids: docIds }),
    });
    if (!response.ok) throw new Error("Failed to compare documents");
    return ApiService.parseJsonSafe(response);
  }

  // -------------------- Phase 4: Translation & Multilingual --------------------
  static async translateText(
    text: string,
    targetLanguage: string,
  ): Promise<TranslationResult> {
    const response = await fetch(`${API_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: targetLanguage }),
    });
    if (!response.ok) throw new Error("Failed to translate");
    return ApiService.parseJsonSafe(response);
  }

  static async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    const response = await fetch(`${API_URL}/detect-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Failed to detect language");
    return ApiService.parseJsonSafe(response);
  }

  static async createMultilingualSummary(
    docId: number,
    languages: string[] = ["es", "fr", "de"],
  ): Promise<any> {
    const response = await fetch(`${API_URL}/multilingual-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, target_languages: languages }),
    });
    if (!response.ok) throw new Error("Failed to create multilingual summary");
    return ApiService.parseJsonSafe(response);
  }

  static async getAvailableLanguages(): Promise<Record<string, string>> {
    const response = await fetch(`${API_URL}/languages`);
    if (!response.ok) throw new Error("Failed to get languages");
    const data = await ApiService.parseJsonSafe(response);
    return data.languages || {};
  }
}
