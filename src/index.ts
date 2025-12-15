export interface NotiBoostConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export interface Event {
  event_name: string;
  event_id: string;
  occurred_at: string;
  user_id: string;
  properties?: Record<string, any>;
}

export interface User {
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  properties?: Record<string, any>;
}

export interface ChannelData {
  email?: string;
  phone?: string;
  push_token?: string;
  push_platform?: 'android' | 'ios';
  zns_oa_id?: string;
}

export interface UserPreferences {
  channels?: Record<string, { enabled: boolean }>;
  categories?: Record<string, { enabled: boolean }>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
}

export class NotiBoostError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'NotiBoostError';
  }
}

export class NotiBoostClient {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;
  private retries: number;

  public events: EventsClient;
  public users: UsersClient;

  constructor(config: NotiBoostConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.notiboost.com';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;

    // Initialize resource clients
    this.events = new EventsClient(this);
    this.users = new UsersClient(this);
  }

  async request(
    method: string,
    path: string,
    data: any = null,
    options: RequestOptions = {}
  ): Promise<any> {
    const url = `${this.baseURL}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    let lastError: any;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const fetchOptions: RequestInit = {
          method,
          headers,
          signal: controller.signal
        };

        if (data && (method === 'POST' || method === 'PUT')) {
          fetchOptions.body = JSON.stringify(data);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => ({}));

        if (response.status >= 200 && response.status < 300) {
          return responseData;
        } else if (response.status === 429 && attempt < this.retries) {
          // Rate limit - wait and retry
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
          await this.sleep(retryAfter * 1000);
          continue;
        } else {
          throw new NotiBoostError(
            responseData.message || `HTTP ${response.status}`,
            response.status,
            responseData
          );
        }
      } catch (error: any) {
        lastError = error;
        if (attempt < this.retries && !(error instanceof NotiBoostError)) {
          await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class EventsClient {
  constructor(private client: NotiBoostClient) {}

  async ingest(event: Event, options?: RequestOptions): Promise<any> {
    if (!event.occurred_at) {
      event.occurred_at = new Date().toISOString();
    }
    return this.client.request('POST', '/api/v1/events', event, options);
  }

  async ingestBatch(events: Event[], options?: RequestOptions): Promise<any> {
    return this.client.request('POST', '/api/v1/events/batch', { events }, options);
  }
}

class UsersClient {
  constructor(private client: NotiBoostClient) {}

  async create(user: User, options?: RequestOptions): Promise<any> {
    return this.client.request('POST', '/api/v1/users', user, options);
  }

  async get(userId: string, options?: RequestOptions): Promise<any> {
    return this.client.request('GET', `/api/v1/users/${userId}`, null, options);
  }

  async update(userId: string, data: Partial<User>, options?: RequestOptions): Promise<any> {
    return this.client.request('PUT', `/api/v1/users/${userId}`, data, options);
  }

  async delete(userId: string, options?: RequestOptions): Promise<any> {
    return this.client.request('DELETE', `/api/v1/users/${userId}`, null, options);
  }

  async setChannelData(userId: string, channelData: ChannelData, options?: RequestOptions): Promise<any> {
    return this.client.request('PUT', `/api/v1/users/${userId}/channel_data`, channelData, options);
  }

  async setPreferences(userId: string, preferences: UserPreferences, options?: RequestOptions): Promise<any> {
    return this.client.request('PUT', `/api/v1/users/${userId}/preferences`, preferences, options);
  }
}

export const NotiBoost = NotiBoostClient;

