export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  status: 'online' | 'busy' | 'offline'
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
