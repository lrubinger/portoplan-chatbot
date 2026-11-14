import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { KanbanColumnId, KanbanCard } from '@/types/chat'
import { KANBAN_COLUMNS } from '@/data/mockData'
import { Clock, GripVertical, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const LEVEL_STYLES: Record<KanbanCard['idleLevel'], { text: string; bg: string }> = {
  ok: { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  warning: { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  late: { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
}

export default function Kanban() {
  const { kanbanCards, moveKanbanCard } = useChat()
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [hoveredColumn, setHoveredColumn] = useState<KanbanColumnId | null>(null)

  const handleDrop = (columnId: KanbanColumnId) => {
    if (draggedCardId) {
      const card = kanbanCards.find((c) => c.id === draggedCardId)
      if (card && card.columnId !== columnId) {
        moveKanbanCard(draggedCardId, columnId)
        const colTitle = KANBAN_COLUMNS.find((col) => col.id === columnId)?.title
        toast.success(`"${card.contactName}" movido para "${colTitle}".`)
      }
    }
    setDraggedCardId(null)
    setHoveredColumn(null)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Cabeçalho */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Kanban de Atendimentos</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Arraste os cards entre as colunas para atualizar a etapa de cada lead.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[11px]"
          >
            {kanbanCards.length} leads no funil
          </Badge>
        </div>
      </div>

      {/* Quadro */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {KANBAN_COLUMNS.map((col) => {
            const cards = kanbanCards.filter((c) => c.columnId === col.id)
            const isHovered = hoveredColumn === col.id
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoveredColumn(col.id)
                }}
                onDragLeave={() => setHoveredColumn((h) => (h === col.id ? null : h))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(col.id)
                }}
                className={`w-72 flex flex-col rounded-xl border bg-white transition ${
                  isHovered ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200'
                }`}
              >
                {/* Cabeçalho da coluna */}
                <div
                  className={`px-3.5 py-3 border-b border-slate-100 border-t-4 rounded-t-xl ${col.accent}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <span className="text-sm font-semibold text-slate-800">{col.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
                  {cards.length === 0 ? (
                    <div className="h-full min-h-[100px] rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                      Arraste um card para cá
                    </div>
                  ) : (
                    cards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => setDraggedCardId(card.id)}
                        onDragEnd={() => {
                          setDraggedCardId(null)
                          setHoveredColumn(null)
                        }}
                        className={`group bg-white border rounded-lg p-3 cursor-grab active:cursor-grabbing transition shadow-sm hover:shadow-md ${
                          draggedCardId === card.id
                            ? 'opacity-40 border-emerald-300'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={
                              card.contactAvatar ||
                              'https://img.usecurling.com/ppl/thumbnail?seed=1'
                            }
                            alt={card.contactName}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {card.contactName}
                              </span>
                              <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {card.summary}
                            </p>
                            {card.dealValue && (
                              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                                {card.dealValue}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${LEVEL_STYLES[card.idleLevel].bg} ${LEVEL_STYLES[card.idleLevel].text}`}
                          >
                            <Clock className="h-2.5 w-2.5" />
                            {card.idleTime}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="h-3 w-3" />
                            <span className="text-[10px]">{card.phone}</span>
                          </div>
                        </div>

                        {card.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {card.tags.slice(0, 2).map((t, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
