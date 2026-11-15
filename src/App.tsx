/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChatProvider } from '@/context/ChatContext'
import Layout from './components/Layout'
import { ProtectedRoute, SuperAdminRoute } from './components/ProtectedRoute'
import Index from './pages/Index'
import Inbox from './pages/Inbox'
import Kanban from './pages/Kanban'
import Flows from './pages/Flows'
import InternalChat from './pages/InternalChat'
import Contacts from './pages/Contacts'
import Automations from './pages/Automations'
import AppSettings from './pages/Settings'
import Administration from './pages/Administration'
import NotFound from './pages/NotFound'
import RealInboxPilot from './pages/RealInboxPilot'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const appBase = import.meta.env.VITE_APP_BASE_PATH || '/'

const App = () => (
  <BrowserRouter basename={appBase}>
    <TooltipProvider>
      <ChatProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <Routes>
          {/* Piloto isolado: autenticação e Inbox do backend real */}
          <Route path="/integracao-v2" element={<RealInboxPilot />} />
          {appBase !== '/' && <Route path="/" element={<RealInboxPilot />} />}
          {appBase !== '/' && <Route path="/inbox" element={<RealInboxPilot />} />}
          {/* Rota pública de login */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Rotas no Layout com Sidebar */}
          {appBase === '/' && <Route element={<Layout />}>
            <Route path="/" element={<Index />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/chat-interno" element={<InternalChat />} />
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/automacoes" element={<Automations />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/fluxos" element={<Flows />} />
              <Route path="/configuracoes" element={<AppSettings />} />
              <Route element={<SuperAdminRoute />}>
                <Route path="/administracao" element={<Administration />} />
              </Route>
            </Route>
          </Route>}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChatProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
