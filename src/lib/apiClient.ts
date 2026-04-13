/**
 * apiClient — authenticated fetch wrapper
 *
 * All requests to /api/* go through here so the Supabase JWT is attached
 * automatically. Never call supabase.from() in the frontend — use this instead.
 */
import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3030'

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    // Token expired — sign out and let the app redirect to login
    await supabase.auth.signOut()
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `API error ${res.status}`)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),

  /** SSE streaming — returns the raw Response so the caller can read the stream */
  stream: async (path: string, body: unknown): Promise<Response> => {
    const authHeader = await getAuthHeader()
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(body),
    })
  },
}
