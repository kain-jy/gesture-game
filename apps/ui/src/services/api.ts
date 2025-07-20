// API interfaces based on connector service

export interface ModelRequest {
  model: string;
  theme: string; // Single character theme, e.g., 'C'
  image: string; // Base64 encoded image data
}

export interface ModelResponse {
  reason: string;
  score: number;
}

export interface SessionRequest {
  session_id: string;
  theme: string;
}

const Message = {
  INITIALIZE: "initialize",
  WAITING: "waiting",
  SUCCESS: "success",
}

export type Message = typeof Message[keyof typeof Message];

export interface SessionResponse {
  status: boolean;
  message: Message;
  data: Record<string, ModelResponse> | null;
  image_url: string;
}

// API client functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createSession(request: SessionRequest): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }


  async createInvocation(request: ModelRequest): Promise<ModelResponse> {
    const response = await fetch(`${this.baseUrl}invocations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getResult(sessionId?: string): Promise<SessionResponse> {
    const url = new URL(`${this.baseUrl}result`);
    if (sessionId) {
      url.searchParams.append('session_id', sessionId);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Default client instance
export const apiClient = new ApiClient();