import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/context/ChatContext'
import { DEMO_USERS } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Bot, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const { login } = useChat()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana.costa@portoplan.com.br')
  const [password, setPassword] = useState('••••••••')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Informe um e-mail para acessar.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      login(email)
      toast.success('Login efetuado com sucesso!')
      navigate('/inbox')
      setLoading(false)
    }, 350)
  }

  const selectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('••••••••')
    toast.info(`Credenciais selecionadas: ${demoEmail}`)
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Lado Esquerdo - Branding BotConversa & PortoPlan */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight">CHATBOT PORTOPLAN</span>
                <Badge
                  variant="outline"
                  className="text-emerald-400 border-emerald-400/40 text-[10px] uppercase font-semibold"
                >
                  Demo v1
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Atendimento Inteligente & WhatsApp Hub</p>
            </div>
          </div>

          <div className="max-w-md my-auto pt-6 md:pt-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-emerald-300 border border-white/10 mb-4">
              ✨ Painel Limpo & Minimalista Estilo BotConversa
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
              Automação inteligente para seu atendimento.
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              Organize conversas de WhatsApp em tempo real, colabore no chat interno da equipe,
              gerencie contatos e automatize mensagens de boas-vindas e ausência.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  ✓
                </div>
                <span>Inbox ágil com histórico, status lida/não lida e respostas rápidas</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  ✓
                </div>
                <span>Chat interno confidencial para corretores e atendentes</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  ✓
                </div>
                <span>Automações de boas-vindas, horários de atendimento e ausência</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>PortoPlan Imóveis &amp; BotConversa UI</span>
          <span>Demonstração Interativa</span>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Acesse sua conta</h2>
            <p className="text-sm text-slate-500 mt-1">
              Use seu e-mail e senha para acessar a plataforma de atendimento automatizado.
            </p>
          </div>

          {/* Banner de Demonstração / Contas Rápidas */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Contas de Demonstração (Clique para preencher)
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] bg-emerald-100 text-emerald-800 border-none"
              >
                Pronto para teste
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectDemoUser(user.email)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition border ${
                    email === user.email
                      ? 'bg-emerald-100/70 border-emerald-400 font-medium text-emerald-900 shadow-sm'
                      : 'bg-white border-emerald-100 hover:border-emerald-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail corporativo
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@portoplan.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => toast.info('Modo demonstração: qualquer senha é aceita')}
                  className="text-xs text-emerald-600 hover:underline hover:text-emerald-700"
                >
                  Esqueci a senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm"
            >
              {loading ? (
                'Entrando...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar no Painel <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Ambiente de demonstração sem conexão com a API do bot.portoplan. Todos os dados são em
            memória.
          </div>
        </div>
      </div>
    </div>
  )
}
