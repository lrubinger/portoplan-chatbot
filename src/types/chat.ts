export type AccessLevel = 'super_admin' | 'admin' | 'user'

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  user: 'Usuário',
}

// Conversas privadas de um nível são visíveis por quem tem nível >= ele,
// exceto quando o usuário está na lista de exceções (bloqueado) da conversa.
export const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  user: 1,
  admin: 2,
  super_admin: 3,
}

export const PRIVATE_LEVEL_ORDER: AccessLevel[] = ['user', 'admin', 'super_admin']

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
  accessLevel: AccessLevel
}

export interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  lastInteraction: string
  tags: string[]
  email?: string
  notes?: string
}

export interface Message {
  id: string
  sender: 'contact' | 'agent' | 'bot'
  senderName?: string
  text: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  contactId: string
  contactName: string
  contactPhone: string
  contactAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isResolved: boolean
  assignedAgent?: string
  tags: string[]
  messages: Message[]
  // Conversa privada para um nível: só é visível a usuários com nível >= privateLevel
  // (respeitando a lista de exceções/bloqueios configurada pelo super administrador).
  privateLevel?: AccessLevel
}

// ---------- Administração / permissões ----------

export interface UserPermissions {
  userId: string
  privateLevels: AccessLevel[] // níveis de conversa privada que este usuário pode ver
  blockedUserIds: string[] // usuários cujas conversas este usuário não pode ver
}

export interface InternalMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  timestamp: string
  channelId?: string
}

export interface InternalChannel {
  id: string
  name: string
  description?: string
  isDirect?: boolean
  members: string[] // User IDs or names
}

export interface QuickReply {
  id: string
  title: string
  shortcut: string
  text: string
  category: 'saudacao' | 'informacao' | 'encerramento' | 'geral'
}

export interface Automation {
  id: string
  name: string
  trigger: 'welcome' | 'absence' | 'keyword'
  keyword?: string
  message: string
  isActive: boolean
  description: string
  updatedAt: string
}

export interface BusinessHours {
  enabled: boolean
  weekdaysStart: string
  weekdaysEnd: string
  saturdayEnabled: boolean
  saturdayStart: string
  saturdayEnd: string
  sundayEnabled: boolean
  timezone: string
}

// ---------- Multi-atendimento (transferência) ----------

export interface TransferRecord {
  id: string
  conversationId: string
  fromAgent: string
  toAgent: string
  reason?: string
  timestamp: string
}

// ---------- Kanban ----------

export type KanbanColumnId = string

export interface KanbanCard {
  id: string
  contactId: string
  contactName: string
  contactAvatar?: string
  phone: string
  summary: string
  interest?: string
  idleTime: string
  idleLevel: 'ok' | 'warning' | 'late'
  dealValue?: string
  tags: string[]
  columnId: KanbanColumnId
}

export interface KanbanColumn {
  id: KanbanColumnId
  title: string
  accent: string
  dot: string
}

// Padrões de cor disponíveis ao criar/editar uma coluna nova
export const KANBAN_COLUMN_STYLES: Pick<KanbanColumn, 'accent' | 'dot'>[] = [
  { accent: 'border-t-sky-500', dot: 'bg-sky-500' },
  { accent: 'border-t-emerald-500', dot: 'bg-emerald-500' },
  { accent: 'border-t-amber-500', dot: 'bg-amber-500' },
  { accent: 'border-t-violet-500', dot: 'bg-violet-500' },
  { accent: 'border-t-slate-500', dot: 'bg-slate-500' },
  { accent: 'border-t-rose-500', dot: 'bg-rose-500' },
  { accent: 'border-t-indigo-500', dot: 'bg-indigo-500' },
]

// ---------- Conexão do WhatsApp (QR code) ----------

export type WhatsappStatus = 'disconnected' | 'waiting' | 'connected'

export interface WhatsappConnection {
  status: WhatsappStatus
  phone?: string
  connectedAt?: string
  device?: string
}

// ---------- Atendimento por Fluxo ----------

export type FlowStepType = 'message' | 'question' | 'condition' | 'action'

export type FlowActionKind = 'transfer_agent' | 'tag_contact' | 'end_chat' | 'send_message'

export interface FlowOption {
  id: string
  label: string
  nextStepId?: string
}

export interface FlowStep {
  id: string
  type: FlowStepType
  title: string
  content?: string
  options?: FlowOption[]
  actionKind?: FlowActionKind
  actionDetail?: string
}

export interface Flow {
  id: string
  name: string
  description: string
  triggerLabel: string
  isActive: boolean
  updatedAt: string
  steps: FlowStep[]
}
