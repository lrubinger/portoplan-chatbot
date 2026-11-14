import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import {
  Shield,
  Lock,
  Users,
  BadgeCheck,
  MessageSquare,
  MessageSquareOff,
  ChevronDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ACCESS_LEVEL_LABELS, AccessLevel, PRIVATE_LEVEL_ORDER } from '@/types/chat'

export default function Administration() {
  const { users, userPermissions, updateUserAccess, toggleUserBlocked, currentUser } = useChat()
  const [expandedUserId, setExpandedUserId] = useState<string | null>(
    users.find((u) => u.accessLevel === 'user')?.id ?? null,
  )

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              Administração
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Defina o nível de acesso de cada usuário e libere quais conversas privadas cada um
              pode visualizar. Apenas o super administrador acessa esta tela.
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[11px]"
          >
            Super Admin
          </Badge>
        </div>

        {/* Como funcionam os níveis */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Regras dos níveis
          </p>
          <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-3">
            <div className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Usuário</strong> — enxerga apenas conversas públicas e as privadas que forem
                liberadas para ele.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <span>
                <strong>Administrador</strong> — além do que o usuário vê, enxerga conversas
                privadas de administrador.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <span>
                <strong>Super administrador</strong> — enxerga todas as conversas, incluindo as
                privadas de super administrador (ex.: financeiro).
              </span>
            </div>
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="space-y-3">
          {users.map((user) => {
            const perms = userPermissions.find((p) => p.userId === user.id)
            const privateLevels = perms?.privateLevels ?? []
            const blocked = perms?.blockedUserIds ?? []
            const isExpanded = expandedUserId === user.id

            return (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-[10px] text-indigo-600 font-bold">você</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      user.accessLevel === 'super_admin'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]'
                        : user.accessLevel === 'admin'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                          : 'bg-slate-100 text-slate-600 border-slate-200 text-[10px]'
                    }
                  >
                    {ACCESS_LEVEL_LABELS[user.accessLevel]}
                  </Badge>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-5 bg-slate-50/60">
                    {/* Nível de acesso */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Nível de acesso
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(ACCESS_LEVEL_LABELS) as AccessLevel[]).map((level) => (
                          <button
                            key={level}
                            onClick={() =>
                              updateUserAccess(user.id, { accessLevel: level, privateLevels })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                              user.accessLevel === level
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {ACCESS_LEVEL_LABELS[level]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conversas privadas liberadas */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Conversas privadas liberadas
                      </p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Níveis iguais ou superiores já veem por padrão — marque para liberar também
                        a quem está abaixo.
                      </p>
                      <div className="space-y-2">
                        {PRIVATE_LEVEL_ORDER.map((level) => {
                          const isOwnLevelOrAbove =
                            user.accessLevel === 'super_admin' ||
                            (user.accessLevel === 'admin' && level !== 'super_admin')
                          return (
                            <div
                              key={level}
                              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5 text-violet-600" />
                                <span className="text-xs text-slate-700">
                                  {ACCESS_LEVEL_LABELS[level]}
                                </span>
                                {isOwnLevelOrAbove && (
                                  <span className="text-[10px] text-slate-400">
                                    (já incluído pelo nível)
                                  </span>
                                )}
                              </div>
                              <Switch
                                checked={privateLevels.includes(level)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...privateLevels, level]
                                    : privateLevels.filter((l) => l !== level)
                                  updateUserAccess(user.id, {
                                    accessLevel: user.accessLevel,
                                    privateLevels: next,
                                  })
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Restrição por atendente */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Restringir por atendente específico
                      </p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Bloqueia as conversas privadas deste atendente para o usuário selecionado.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {users
                          .filter((u) => u.id !== user.id)
                          .map((other) => (
                            <button
                              key={other.id}
                              onClick={() => toggleUserBlocked(user.id, other.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition ${
                                blocked.includes(other.id)
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {blocked.includes(other.id) ? (
                                <MessageSquareOff className="h-3.5 w-3.5" />
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5" />
                              )}
                              {other.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
