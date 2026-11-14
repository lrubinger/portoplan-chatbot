import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { Flow, FlowStep } from '@/types/chat'
import {
  Workflow,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Zap,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Power,
  UserCog,
  Tag,
  XCircle,
  Send,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const STEP_META: Record<
  FlowStep['type'],
  { label: string; icon: typeof MessageSquare; color: string; bg: string; border: string }
> = {
  message: {
    label: 'Mensagem',
    icon: MessageSquare,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  question: {
    label: 'Pergunta',
    icon: HelpCircle,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  condition: {
    label: 'Condição',
    icon: GitBranch,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  action: {
    label: 'Ação',
    icon: Zap,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
}

const ACTION_ICON: Record<string, typeof UserCog> = {
  transfer_agent: UserCog,
  tag_contact: Tag,
  end_chat: XCircle,
  send_message: Send,
}

const ACTION_LABEL: Record<string, string> = {
  transfer_agent: 'Transferir para atendente',
  tag_contact: 'Etiquetar contato',
  end_chat: 'Encerrar atendimento',
  send_message: 'Enviar mensagem',
}

function StepIcon({ type }: { type: FlowStep['type'] }) {
  const meta = STEP_META[type]
  const Icon = meta.icon
  return (
    <span
      className={`h-8 w-8 rounded-lg ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center shrink-0`}
    >
      <Icon className="h-4 w-4" />
    </span>
  )
}

function StepBlock({
  step,
  isLast,
  onAddOption,
  onDelete,
}: {
  step: FlowStep
  isLast: boolean
  onAddOption: (label: string) => void
  onDelete: () => void
}) {
  const [showOptionInput, setShowOptionInput] = useState(false)
  const [optionLabel, setOptionLabel] = useState('')
  const meta = STEP_META[step.type]

  const submitOption = () => {
    if (!optionLabel.trim()) return
    onAddOption(optionLabel.trim())
    setOptionLabel('')
    setShowOptionInput(false)
  }

  return (
    <div className="relative pl-8">
      {/* Linha vertical da árvore */}
      {!isLast && <span className="absolute left-[15px] top-10 bottom-0 w-px bg-slate-200" />}

      <div className="relative">
        {/* Conector */}
        {!isLast && (
          <span className="absolute -bottom-4 left-[15px] h-4 w-px bg-slate-200">
            <ChevronDown className="absolute -bottom-1 -left-[7px] h-3.5 w-3.5 text-slate-300 bg-white" />
          </span>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition group">
          <div className="flex items-start gap-3">
            <StepIcon type={step.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}
                >
                  {meta.label}
                </span>
                <span className="text-sm font-semibold text-slate-800">{step.title}</span>
              </div>

              {step.content && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.content}</p>
              )}

              {step.type === 'action' && step.actionKind && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-violet-700">
                  {(() => {
                    const AIcon = ACTION_ICON[step.actionKind] || Zap
                    return <AIcon className="h-3.5 w-3.5" />
                  })()}
                  <span className="font-medium">
                    {ACTION_LABEL[step.actionKind] || step.actionKind}
                  </span>
                  {step.actionDetail && (
                    <span className="text-slate-400">→ {step.actionDetail}</span>
                  )}
                </div>
              )}

              {step.options && step.options.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {step.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 w-fit max-w-full"
                    >
                      <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-medium truncate">{opt.label}</span>
                      {opt.nextStepId && (
                        <span className="text-[10px] text-slate-400 shrink-0">→ próxima etapa</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
              {step.type === 'question' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-sky-700 hover:bg-sky-50"
                  onClick={() => setShowOptionInput((v) => !v)}
                >
                  <Plus className="h-3 w-3 mr-0.5" /> Opção
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                onClick={onDelete}
                title="Remover etapa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {showOptionInput && (
            <div className="mt-2.5 pl-11 flex items-center gap-2">
              <Input
                value={optionLabel}
                onChange={(e) => setOptionLabel(e.target.value)}
                placeholder="Texto da opção de resposta..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitOption()
                }}
              />
              <Button
                size="sm"
                className="h-8 text-xs bg-sky-600 hover:bg-sky-700"
                onClick={submitOption}
              >
                Adicionar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Flows() {
  const { flows, toggleFlow, addFlowStep, addFlowOption, deleteFlowStep } = useChat()
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(flows[0]?.id ?? null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newStepType, setNewStepType] = useState<FlowStep['type']>('message')
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepContent, setNewStepContent] = useState('')

  const selectedFlow = flows.find((f) => f.id === selectedFlowId) || null

  const handleAddStep = () => {
    if (!selectedFlow || !newStepTitle.trim()) return
    addFlowStep(selectedFlow.id, {
      type: newStepType,
      title: newStepTitle.trim(),
      content: newStepContent.trim() || undefined,
      actionDetail: newStepType === 'action' ? 'Atendente disponível' : undefined,
    })
    toast.success('Etapa adicionada ao fluxo!')
    setNewStepTitle('')
    setNewStepContent('')
    setAddDialogOpen(false)
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50">
      {/* Coluna 1: Lista de fluxos */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Workflow className="h-5 w-5 text-emerald-600" />
              Fluxos
            </h1>
            <Badge
              variant="outline"
              className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px]"
            >
              {flows.filter((f) => f.isActive).length} ativos
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Jornadas automáticas do chatbot: mensagens, perguntas e ações encadeadas.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {flows.map((flow) => {
            const isSelected = flow.id === selectedFlowId
            return (
              <div
                key={flow.id}
                onClick={() => setSelectedFlowId(flow.id)}
                className={`p-3.5 cursor-pointer transition relative ${
                  isSelected
                    ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 truncate">{flow.name}</span>
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${flow.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    title={flow.isActive ? 'Ativo' : 'Inativo'}
                  />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{flow.description}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      flow.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {flow.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {flow.steps.length} etapas • {flow.updatedAt}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coluna 2: Detalhe do fluxo */}
      {selectedFlow ? (
        <FlowDetail
          key={selectedFlow.id}
          flow={selectedFlow}
          onToggle={() => toggleFlow(selectedFlow.id)}
          onAddOption={(stepId, label) => addFlowOption(selectedFlow.id, stepId, label)}
          onDeleteStep={(stepId) => deleteFlowStep(selectedFlow.id, stepId)}
          onOpenAdd={() => setAddDialogOpen(true)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Selecione um fluxo para visualizar as etapas.
        </div>
      )}

      {/* Dialog nova etapa */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Nova etapa em "{selectedFlow?.name}"</DialogTitle>
            <DialogDescription className="text-xs">
              A etapa será adicionada ao final do fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(STEP_META) as FlowStep['type'][]).map((t) => {
                const meta = STEP_META[t]
                const Icon = meta.icon
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewStepType(t)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-medium transition ${
                      newStepType === t
                        ? `${meta.bg} ${meta.color} ${meta.border} ring-1 ${meta.border}`
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {meta.label}
                  </button>
                )
              })}
            </div>
            <Input
              placeholder="Título da etapa (ex.: Informar horários)"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              placeholder="Texto da mensagem/pergunta (opcional)"
              value={newStepContent}
              onChange={(e) => setNewStepContent(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAddStep}
              disabled={!newStepTitle.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Adicionar etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FlowDetail({
  flow,
  onToggle,
  onAddOption,
  onDeleteStep,
  onOpenAdd,
}: {
  flow: Flow
  onToggle: () => void
  onAddOption: (stepId: string, label: string) => void
  onDeleteStep: (stepId: string) => void
  onOpenAdd: () => void
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Cabeçalho */}
      <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 truncate">{flow.name}</h2>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                flow.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {flow.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">Gatilho: {flow.triggerLabel}</p>
        </div>
        <Button
          variant={flow.isActive ? 'outline' : 'default'}
          size="sm"
          onClick={onToggle}
          className={`h-8 text-xs ${
            flow.isActive
              ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Power className="h-3.5 w-3.5 mr-1" />
          {flow.isActive ? 'Desativar fluxo' : 'Ativar fluxo'}
        </Button>
      </div>

      {/* Árvore de etapas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {flow.steps.map((step, idx) => (
            <StepBlock
              key={step.id}
              step={step}
              isLast={idx === flow.steps.length - 1}
              onAddOption={(label) => onAddOption(step.id, label)}
              onDelete={() => onDeleteStep(step.id)}
            />
          ))}
          <button
            type="button"
            onClick={onOpenAdd}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Adicionar etapa ao fluxo
          </button>
        </div>
      </div>
    </div>
  )
}
