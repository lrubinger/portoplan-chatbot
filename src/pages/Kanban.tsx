import { useState } from 'react'
import { useChat } from '@/context/ChatContext'
import { KanbanCard, KanbanColumn, KANBAN_COLUMN_STYLES } from '@/types/chat'
import {
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Pencil,
  Clock,
  Phone,
  DollarSign,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface CardFormData {
  contactName: string
  value: string
  tags: string
  phone: string
  columnId: string
}

const EMPTY_FORM: CardFormData = {
  contactName: '',
  value: '',
  tags: '',
  phone: '',
  columnId: '',
}

function idleLevelClass(level: string) {
  if (level === 'danger') return 'text-rose-600 bg-rose-50 border-rose-200'
  if (level === 'warning') return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-emerald-600 bg-emerald-50 border-emerald-200'
}

export default function Kanban() {
  const {
    kanbanColumns,
    kanbanCards,
    moveKanbanCard,
    addKanbanCard,
    updateKanbanCard,
    deleteKanbanCard,
    renameKanbanColumn,
    addKanbanColumn,
    deleteKanbanColumn,
  } = useChat()

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Modal de card
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState<CardFormData>(EMPTY_FORM)

  // Exclusão de card
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null)

  // Colunas
  const [renamingColumnId, setRenamingColumnId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newColumnOpen, setNewColumnOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null)
  const [deleteColumnMode, setDeleteColumnMode] = useState<'move' | 'delete'>('move')
  const [deleteColumnTarget, setDeleteColumnTarget] = useState('')

  const cardsIn = (columnId: string) => kanbanCards.filter((c) => c.columnId === columnId)

  const openNewCard = (columnId: string) => {
    setEditingCardId(null)
    setCardForm({ ...EMPTY_FORM, columnId })
    setCardModalOpen(true)
  }

  const openEditCard = (card: KanbanCard) => {
    setEditingCardId(card.id)
    setCardForm({
      contactName: card.contactName,
      value: (card.dealValue ?? '').replace(/[^\d,]/g, ''),
      tags: card.tags.join(', '),
      phone: card.phone,
      columnId: card.columnId,
    })
    setCardModalOpen(true)
  }

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardForm.contactName.trim() || !cardForm.columnId) {
      toast.error('Informe pelo menos o nome/contato e a coluna do card.')
      return
    }

    const payload = {
      contactId: '',
      contactName: cardForm.contactName.trim(),
      summary: '',
      dealValue: cardForm.value.trim() ? `R$ ${cardForm.value.trim()}` : 'R$ 0',
      tags: cardForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      phone: cardForm.phone.trim() || '—',
      columnId: cardForm.columnId,
    }

    if (editingCardId) {
      updateKanbanCard(editingCardId, payload)
      toast.success('Card atualizado!')
    } else {
      addKanbanCard(payload)
      toast.success('Card criado no Kanban!')
    }
    setCardModalOpen(false)
  }

  const confirmDeleteCard = () => {
    if (!deleteCardId) return
    deleteKanbanCard(deleteCardId)
    setDeleteCardId(null)
    toast.success('Card excluído do Kanban.')
  }

  const handleRenameColumn = (columnId: string) => {
    if (!renameValue.trim()) {
      toast.error('Informe o novo título da coluna.')
      return
    }
    renameKanbanColumn(columnId, renameValue)
    setRenamingColumnId(null)
    toast.success('Coluna renomeada!')
  }

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnTitle.trim()) {
      toast.error('Informe o título da nova coluna.')
      return
    }
    addKanbanColumn(newColumnTitle)
    setNewColumnTitle('')
    setNewColumnOpen(false)
    toast.success('Nova coluna adicionada ao final do quadro!')
  }

  const deletingColumn = kanbanColumns.find((c) => c.id === deleteColumnId)
  const deletingColumnCards = deletingColumn ? cardsIn(deletingColumn.id) : []
  const otherColumns = kanbanColumns.filter((c) => c.id !== deleteColumnId)

  const handleConfirmDeleteColumn = () => {
    if (!deleteColumnId) return
    deleteKanbanColumn(
      deleteColumnId,
      deleteColumnMode,
      deleteColumnMode === 'move' ? deleteColumnTarget || otherColumns[0]?.id : undefined,
    )
    setDeleteColumnId(null)
    toast.success('Coluna removida do quadro.')
  }

  const renderColumn = (column: KanbanColumn) => {
    const cards = cardsIn(column.id)
    return (
      <div
        key={column.id}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverColumn(column.id)
        }}
        onDragLeave={() => setDragOverColumn(null)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOverColumn(null)
          if (draggedCardId) {
            moveKanbanCard(draggedCardId, column.id)
            setDraggedCardId(null)
          }
        }}
        className={`w-72 shrink-0 rounded-xl border-t-4 ${column.accent} ${
          dragOverColumn === column.id ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-white'
        } border border-slate-200 shadow-sm flex flex-col max-h-full transition-colors`}
      >
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
          {renamingColumnId === column.id ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameColumn(column.id)
                  if (e.key === 'Escape') setRenamingColumnId(null)
                }}
                className="h-7 text-xs"
              />
              <Button
                size="icon"
                className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                onClick={() => handleRenameColumn(column.id)}
              >
                ✓
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${column.dot}`} />
                <h3 className="text-sm font-bold text-slate-800 truncate">{column.title}</h3>
                <span className="text-[11px] text-slate-400 shrink-0">{cards.length}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 shrink-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem
                    onClick={() => {
                      setRenamingColumnId(column.id)
                      setRenameValue(column.title)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Renomear coluna
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openNewCard(column.id)}
                    className="text-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" /> Novo card aqui
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setDeleteColumnId(column.id)
                      setDeleteColumnMode('move')
                      setDeleteColumnTarget('')
                    }}
                    className="text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Remover coluna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
          {cards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => setDraggedCardId(card.id)}
              onDragEnd={() => setDraggedCardId(null)}
              className={`group bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-sm transition ${
                draggedCardId === card.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={card.contactAvatar}
                    alt={card.contactName}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {card.contactName}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditCard(card)}
                    title="Editar card"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCardId(card.id)}
                    title="Excluir card"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> {card.dealValue ?? 'R$ 0'}
                </span>
                <span
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${idleLevelClass(card.idleLevel)}`}
                >
                  <Clock className="h-3 w-3" /> {card.idleTime} sem resposta
                </span>
              </div>

              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      <Tag className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Phone className="h-2.5 w-2.5" /> {card.phone}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => openNewCard(column.id)}
            className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition flex items-center justify-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Novo card
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            📋 Kanban de Negócios
          </h1>
          <p className="text-xs text-slate-500">
            Arraste os cards entre colunas, crie, edite e exclua cards e gerencie as colunas do
            funil.
          </p>
        </div>
        <Button
          onClick={() => openNewCard(kanbanColumns[0]?.id ?? '')}
          className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Novo Card
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 items-stretch h-full min-h-0">
          {kanbanColumns.map(renderColumn)}

          {newColumnOpen ? (
            <form
              onSubmit={handleAddColumn}
              className="w-64 shrink-0 rounded-xl border border-indigo-200 bg-white p-3 space-y-2 shadow-sm"
            >
              <Label className="text-xs font-semibold text-slate-700">Título da coluna</Label>
              <Input
                autoFocus
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Ex: Proposta enviada"
                className="h-8 text-xs"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="h-7 text-xs flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Criar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setNewColumnOpen(false)
                    setNewColumnTitle('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setNewColumnOpen(true)}
              className="w-64 shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition flex flex-col items-center justify-center gap-1 text-xs font-medium"
            >
              <Plus className="h-5 w-5" /> Adicionar coluna
            </button>
          )}
        </div>
      </div>

      {/* Modal de Card (criar/editar) */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              {editingCardId ? 'Editar Card' : 'Novo Card do Kanban'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCard} className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome / Contato *</Label>
              <Input
                value={cardForm.contactName}
                onChange={(e) => setCardForm({ ...cardForm, contactName: e.target.value })}
                placeholder="Ex: Beatriz Nogueira"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor do negócio</Label>
                <Input
                  value={cardForm.value}
                  onChange={(e) => setCardForm({ ...cardForm, value: e.target.value })}
                  placeholder="350.000"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Telefone</Label>
                <Input
                  value={cardForm.phone}
                  onChange={(e) => setCardForm({ ...cardForm, phone: e.target.value })}
                  placeholder="+55 31 99999-0000"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tags (separadas por vírgula)</Label>
              <Input
                value={cardForm.tags}
                onChange={(e) => setCardForm({ ...cardForm, tags: e.target.value })}
                placeholder="Quarto e sala, Zona Sul, Quente"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Coluna *</Label>
              <Select
                value={cardForm.columnId}
                onValueChange={(v) => setCardForm({ ...cardForm, columnId: v })}
              >
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue placeholder="Selecione a coluna destino" />
                </SelectTrigger>
                <SelectContent>
                  {kanbanColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id} className="text-xs">
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCardModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editingCardId ? 'Salvar alterações' : 'Criar card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão de card */}
      <Dialog open={!!deleteCardId} onOpenChange={(open) => !open && setDeleteCardId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Excluir card?</DialogTitle>
            <DialogDescription className="text-xs">
              O card será removido definitivamente do Kanban (dados de demonstração, a ação não é
              desfeita).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteCardId(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={confirmDeleteCard}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remoção de coluna (mover ou excluir cards) */}
      <Dialog open={!!deleteColumnId} onOpenChange={(open) => !open && setDeleteColumnId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              Remover coluna "{deletingColumn?.title}"?
            </DialogTitle>
            <DialogDescription className="text-xs">
              {deletingColumnCards.length > 0
                ? `Esta coluna possui ${deletingColumnCards.length} card(s). Escolha o que fazer com eles:`
                : 'A coluna está vazia e será removida.'}
            </DialogDescription>
          </DialogHeader>

          {deletingColumnCards.length > 0 && (
            <div className="space-y-2 py-1">
              <label
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                  deleteColumnMode === 'move'
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  checked={deleteColumnMode === 'move'}
                  onChange={() => setDeleteColumnMode('move')}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold text-slate-800">Mover os cards</span> para outra
                  coluna
                </span>
              </label>

              {deleteColumnMode === 'move' && (
                <Select value={deleteColumnTarget} onValueChange={setDeleteColumnTarget}>
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Coluna destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="text-xs">
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <label
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                  deleteColumnMode === 'delete'
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  checked={deleteColumnMode === 'delete'}
                  onChange={() => setDeleteColumnMode('delete')}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold text-rose-700">Excluir os cards</span> junto com a
                  coluna
                </span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteColumnId(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteColumn}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Remover coluna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
