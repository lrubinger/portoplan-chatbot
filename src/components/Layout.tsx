import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useChat } from '@/context/ChatContext'
import {
  MessageSquare,
  Users2,
  Contact,
  Bot,
  Settings,
  LogOut,
  KanbanSquare,
  Workflow,
  Shield,
} from 'lucide-react'
import { ACCESS_LEVEL_LABELS } from '@/types/chat'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'

export default function Layout() {
  const { currentUser, logout, visibleConversations, internalMessages, isSuperAdmin } = useChat()
  const navigate = useNavigate()
  const location = useLocation()

  // Se estiver na tela de login, não renderiza a sidebar
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full bg-slate-50 flex flex-col">
        <Outlet />
      </main>
    )
  }

  // Contagem de não lidos para badges (apenas conversas visíveis ao nível logado)
  const unreadCount = visibleConversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0)

  const handleLogout = () => {
    logout()
    toast.info('Você saiu da sua conta.')
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Sidebar Minimalista estilo BotConversa */}
      <aside className="w-16 md:w-20 bg-slate-900 border-r border-slate-800 flex flex-col justify-between items-center py-4 shrink-0 z-30 select-none">
        {/* Logo / Marca */}
        <div className="flex flex-col items-center gap-6">
          <div
            onClick={() => navigate('/inbox')}
            className="cursor-pointer h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 hover:scale-105 transition"
            title="Chatbot PortoPlan"
          >
            <Bot className="h-6 w-6" />
          </div>

          {/* Menus de Navegação */}
          <nav className="flex flex-col items-center gap-2">
            {/* WhatsApp Inbox */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/inbox"
                  className={({ isActive }) =>
                    `relative h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-950 font-bold text-[10px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">WhatsApp Inbox</p>
              </TooltipContent>
            </Tooltip>

            {/* Chat Interno */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/chat-interno"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Users2 className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Chat Interno da Equipe</p>
              </TooltipContent>
            </Tooltip>

            {/* Contatos */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/contatos"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Contact className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Contatos &amp; Leads</p>
              </TooltipContent>
            </Tooltip>

            {/* Automações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/automacoes"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Bot className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Regras &amp; Automações</p>
              </TooltipContent>
            </Tooltip>

            {/* Kanban */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/kanban"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <KanbanSquare className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Kanban de Atendimentos</p>
              </TooltipContent>
            </Tooltip>

            {/* Fluxos */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/fluxos"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Workflow className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Fluxos de Atendimento</p>
              </TooltipContent>
            </Tooltip>

            {/* Administração (apenas super administrador) */}
            {isSuperAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/administracao"
                    className={({ isActive }) =>
                      `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Shield className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs font-semibold">Administração &amp; Acessos</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Configurações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/configuracoes"
                  className={({ isActive }) =>
                    `h-11 w-11 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Settings className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-semibold">Configurações &amp; Respostas</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </div>

        {/* Rodapé da Sidebar - Atendente & Logout */}
        <div className="flex flex-col items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div onClick={() => navigate('/configuracoes')} className="cursor-pointer relative">
                <img
                  src={currentUser?.avatar || 'https://img.usecurling.com/ppl/thumbnail?seed=1'}
                  alt={currentUser?.name || 'Atendente'}
                  className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500/80 hover:opacity-90 transition"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-900" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs font-semibold">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400">
                {currentUser ? ACCESS_LEVEL_LABELS[currentUser.accessLevel] : currentUser?.role}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs text-rose-400 font-semibold">Sair da Sessão</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
