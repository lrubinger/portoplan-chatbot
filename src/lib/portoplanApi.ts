/**
 * PortoPlan V2 API adapter. The backend exposes routes at root; configure a same-origin reverse proxy for production.
 * Never put service tokens or secrets in VITE_* variables.
 */
const API_BASE = (import.meta.env.VITE_PORTOPLAN_API_URL || '').replace(/\/$/, '')
let accessToken: string | null = null

export type BackendUser = {
  id: number | string
  name: string
  email: string
  profile?: string
  super?: boolean
  companyId?: number
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' })
  if (!response.ok) {
    if (response.status === 401) accessToken = null
    throw new Error(`PortoPlan API: HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const portoPlanApi = {
  async login(email: string, password: string) {
    const result = await request<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    })
    setAccessToken(result.token)
    return result.user
  },
  async refresh() {
    const result = await request<{ token: string; user: BackendUser }>('/auth/refresh_token', { method: 'POST' })
    setAccessToken(result.token)
    return result.user
  },
  async logout() {
    try { await request('/auth/logout', { method: 'DELETE' }) }
    finally { setAccessToken(null) }
  },
  tickets(status: 'open' | 'pending' | 'closed' = 'open', pageNumber = 1) {
    return request<{ tickets: BackendTicket[]; count: number; hasMore: boolean }>(
      `/tickets?status=${status}&pageNumber=${pageNumber}`
    )
  },
  ticket(id: number | string) {
    return request<BackendTicket>(`/tickets/${encodeURIComponent(String(id))}`)
  },
  messages(ticketId: number | string, pageNumber = 1) {
    return request<{ messages: BackendMessage[]; hasMore: boolean }>(
      `/messages/${encodeURIComponent(String(ticketId))}?pageNumber=${pageNumber}&markRead=false`
    )
  },
  whatsappConnections() {
    return request<BackendWhatsappConnection[]>('/whatsapp/profile/connections')
  },
  startWhatsappConnection(id: number) {
    return request<{ status: string }>(`/whatsapp/profile/connections/${encodeURIComponent(String(id))}/start`, { method: 'POST' })
  },
  disconnectWhatsappConnection(id: number) {
    return request<void>(`/whatsapp/profile/connections/${encodeURIComponent(String(id))}/disconnect`, { method: 'DELETE' })
  },
  updateTicket(id: number | string, changes: { status?: string; userId?: number | string; queueId?: number | null }) {
    return request<BackendTicket>(`/tickets/${encodeURIComponent(String(id))}`, {
      method: 'PUT', body: JSON.stringify(changes)
    })
  },
  users() {
    return request<Array<{ id: number; name: string; email?: string }>>('/users/list')
  },
  contacts(pageNumber = 1, searchParam = '') {
    return request<{ contacts: Array<{ id: number; name: string; number: string }>; hasMore: boolean }>(
      `/contacts?pageNumber=${pageNumber}&searchParam=${encodeURIComponent(searchParam)}`
    )
  },
  quickMessages() {
    return request<{ records: Array<{ id: number; shortcode: string; message: string }>; hasMore: boolean }>('/quick-messages')
  },
  internalChatContacts() {
    return request<Array<{ id: number; name: string; email?: string; unread?: number; lastMessage?: string }>>('/internal-chat/contacts')
  },
  internalChatMessages(userId: number) {
    return request<Array<{ id: number; senderId: number; recipientId: number; body: string; createdAt: string }>>(`/internal-chat/messages/${userId}`)
  },
  sendInternalMessage(userId: number, body: string) {
    return request<void>(`/internal-chat/messages/${userId}`, { method: 'POST', body: JSON.stringify({ body }) })
  },
  kanban() {
    return request<unknown>('/ticket/kanban')
  },
  sendMessage(ticketId: number | string, body: string) {
    return request<void>(`/messages/${encodeURIComponent(String(ticketId))}`, {
      method: 'POST', body: JSON.stringify({ body })
    })
  }
}

export interface BackendTicket {
  id: number
  status: string
  unreadMessages?: number
  lastMessage?: string
  updatedAt?: string
  contact?: { id: number; name: string; number: string; profilePicUrl?: string }
  user?: { name: string }
}

export interface BackendMessage {
  id: string
  body: string
  fromMe: boolean
  createdAt: string
  ack?: number
}

/** Baileys QR payload comes from the authenticated backend, never from a browser-generated mock. */
export interface BackendWhatsappConnection {
  id: number
  name: string
  status: string
  qrcode?: string | null
  provider?: string | null
  companyId?: number
}
