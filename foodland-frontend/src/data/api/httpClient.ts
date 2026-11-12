/** Infrastructure for future REST integration; unused by v0.8 demo. */
export type PageQuery = {
  page: number;
  pageSize: 10;
  search?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function createHttpClient(baseUrl: string, transport: typeof fetch = fetch) {
  const root = baseUrl.replace(/\/+$/, '');
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await transport(`${root}/${path.replace(/^\/+/, '')}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body != null ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });

    if (!response.ok) {
      // Keep the server response in logs only when needed; avoid leaking internal
      // messages or HTML error pages into user-facing error text.
      throw new HttpError(response.status, `Yêu cầu thất bại (HTTP ${response.status}).`);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
  return {
    get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
    post: <T>(path: string, data: unknown, signal?: AbortSignal) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(data), signal }),
    put: <T>(path: string, data: unknown, signal?: AbortSignal) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(data), signal }),
    delete: <T>(path: string, signal?: AbortSignal) =>
      request<T>(path, { method: 'DELETE', signal }),
  };
}
