import React, { createContext, useContext, useState } from 'react'
import {
  User,
  Contact,
  Conversation,
  Message,
  InternalMessage,
  QuickReply,
  Automation,
  BusinessHours,
} from '@/types/chat'
import {
  DEMO_USERS,
  INITIAL_CONTACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_INTERNAL_MESSAGES,
  INITIAL_QUICK_REPLIES,
  INITIAL_AUTOMATIONS,
  INITIAL_BUSINESS_HOURS,
} from '@/data/mockData'

interface ChatContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  login: (email: string) => boolean
  logout: () => void

  // WhatsApp Conversations
  conversations: Conversation[]
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
  sendMessage: (conversationId: string, text: string) => void
  toggleResolved: (conversationId: string) => void
  markAsRead: (conversationId: string) => void
  markAsUnread: (conversationId: string) => void
  simulateClientReply: (conversationId: string, text: string) => void

  // Contacts
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id' | 'lastInteraction'>) => void
  openOrCreateConversationWithContact: (contact: Contact) => string

  // Internal Chat
  internalMessages: InternalMessage[]
  sendInternalMessage: (text: string) => void

  // Quick Replies
  quickReplies: QuickReply[]
  addQuickReply: (reply: Omit<QuickReply, 'id'>) => void
  updateQuickReply: (id: string, reply: Partial<QuickReply>) => void
  deleteQuickReply: (id: string) => void

  // Automations
  automations: Automation[]
  toggleAutomation: (id: string) => void
  addAutomation: (automation: Omit<Automation, 'id' | 'updatedAt'>) => void
  updateAutomation: (id: string, automation: Partial<Automation>) => void
  deleteAutomation: (id: string) => void

  // Business Hours
  businessHours: BusinessHours
  updateBusinessHours: (hours: Partial<BusinessHours>) => void

  // Profile update
  updateCurrentUser: (updates: Partial<User>) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0])
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv-1')
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [internalMessages, setInternalMessages] =
    useState<InternalMessage[]>(INITIAL_INTERNAL_MESSAGES)
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(INITIAL_QUICK_REPLIES)
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS)
  const [businessHours, setBusinessHours] = useState<BusinessHours>(INITIAL_BUSINESS_HOURS)

  const login = (email: string) => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim(),
    )
    if (found) {
      setCurrentUser(found)
      return true
    }
    // Fallback demo user if custom email entered
    setCurrentUser({
      id: `custom-${Date.now()}`,
      name: email.split('@')[0] || 'Atendente Demo',
      email: email,
      role: 'Atendente PortoPlan',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=15',
      status: 'online',
    })
    return true
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'agent',
      senderName: currentUser?.name || 'Atendente',
      text: trimmed,
      timestamp: timeStr,
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: trimmed,
            lastMessageTime: timeStr,
            messages: [...c.messages, newMsg],
          }
        }
        return c
      }),
    )
  }

  const simulateClientReply = (conversationId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: Message = {
      id: `m-client-${Date.now()}`,
      sender: 'contact',
      text: trimmed,
      timestamp: timeStr,
      status: 'delivered',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: trimmed,
            lastMessageTime: timeStr,
            unreadCount: c.id === selectedConversationId ? 0 : c.unreadCount + 1,
            isResolved: false,
            messages: [...c.messages, newMsg],
          }
        }
        return c
      }),
    )
  }

  const toggleResolved = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, isResolved: !c.isResolved }
        }
        return c
      }),
    )
  }

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 }
        }
        return c
      }),
    )
  }

  const markAsUnread = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: Math.max(1, c.unreadCount + 1) }
        }
        return c
      }),
    )
  }

  const addContact = (contactData: Omit<Contact, 'id' | 'lastInteraction'>) => {
    const newId = `c-${Date.now()}`
    const newContact: Contact = {
      ...contactData,
      id: newId,
      lastInteraction: 'Agora',
      avatar:
        contactData.avatar ||
        `https://img.usecurling.com/ppl/thumbnail?seed=${Math.floor(Math.random() * 80)}`,
    }
    setContacts((prev) => [newContact, ...prev])
  }

  const openOrCreateConversationWithContact = (contact: Contact): string => {
    const existing = conversations.find((c) => c.contactId === contact.id)
    if (existing) {
      setSelectedConversationId(existing.id)
      return existing.id
    }

    const newConvId = `conv-${Date.now()}`
    const newConversation: Conversation = {
      id: newConvId,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactAvatar: contact.avatar,
      lastMessage: 'Conversa iniciada',
      lastMessageTime: 'Agora',
      unreadCount: 0,
      isResolved: false,
      assignedAgent: currentUser?.name || 'Ana Paula Costa',
      tags: contact.tags || ['Novo Contato'],
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'bot',
          senderName: 'Chatbot PortoPlan',
          text: `Atendimento aberto para ${contact.name} via WhatsApp.`,
          timestamp: 'Agora',
          status: 'read',
        },
      ],
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedConversationId(newConvId)
    return newConvId
  }

  const sendInternalMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !currentUser) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsg: InternalMessage = {
      id: `im-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: trimmed,
      timestamp: timeStr,
    }

    setInternalMessages((prev) => [...prev, newMsg])
  }

  const addQuickReply = (reply: Omit<QuickReply, 'id'>) => {
    const newReply: QuickReply = {
      ...reply,
      id: `qr-${Date.now()}`,
    }
    setQuickReplies((prev) => [...prev, newReply])
  }

  const updateQuickReply = (id: string, updates: Partial<QuickReply>) => {
    setQuickReplies((prev) => prev.map((qr) => (qr.id === id ? { ...qr, ...updates } : qr)))
  }

  const deleteQuickReply = (id: string) => {
    setQuickReplies((prev) => prev.filter((qr) => qr.id !== id))
  }

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) => (auto.id === id ? { ...auto, isActive: !auto.isActive } : auto)),
    )
  }

  const addAutomation = (automation: Omit<Automation, 'id' | 'updatedAt'>) => {
    const newAuto: Automation = {
      ...automation,
      id: `auto-${Date.now()}`,
      updatedAt: 'Hoje',
    }
    setAutomations((prev) => [...prev, newAuto])
  }

  const updateAutomation = (id: string, updates: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((auto) => (auto.id === id ? { ...auto, ...updates, updatedAt: 'Hoje' } : auto)),
    )
  }

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((auto) => auto.id !== id))
  }

  const updateBusinessHours = (hours: Partial<BusinessHours>) => {
    setBusinessHours((prev) => ({ ...prev, ...hours }))
  }

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        conversations,
        selectedConversationId,
        setSelectedConversationId,
        sendMessage,
        toggleResolved,
        markAsRead,
        markAsUnread,
        simulateClientReply,
        contacts,
        addContact,
        openOrCreateConversationWithContact,
        internalMessages,
        sendInternalMessage,
        quickReplies,
        addQuickReply,
        updateQuickReply,
        deleteQuickReply,
        automations,
        toggleAutomation,
        addAutomation,
        updateAutomation,
        deleteAutomation,
        businessHours,
        updateBusinessHours,
        updateCurrentUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider')
  }
  return context
}
