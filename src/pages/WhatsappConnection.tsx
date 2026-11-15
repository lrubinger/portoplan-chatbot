import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  QrCode,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Smartphone,
  MonitorSmartphone,
  CalendarDays,
  LogOut,
  Info,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useChat } from '@/context/ChatContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Validade simulada de cada QR code gerado (em segundos)
const QR_EXPIRATION_SECONDS = 40

// Gera uma matriz de QR "falsa" (25x25) a partir do payload — apenas visual.
function buildQrMatrix(payload: string, size = 25): boolean[][] {
  let seed = 0
  for (let i = 0; i < payload.length; i++) {
    seed = (seed * 31 + payload.charCodeAt(i)) >>> 0
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
  const matrix: boolean[][] = []
  for (let row = 0; row < size; row++) {
    const line: boolean[] = []
    for (let col = 0; col < size; col++) {
      line.push(rand() > 0.5)
    }
    matrix.push(line)
  }
  // Cantos: finder patterns (quadrado dentro de quadrado), como num QR real
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        matrix[r0 + r][c0 + c] = edge || core
      }
    }
    // respiro ao redor
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r
        const cc = c0 + c
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue
        if (r === -1 || r === 7 || c === -1 || c === 7) matrix[rr][cc] = false
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, size - 7)
  drawFinder(size - 7, 0)
  return matrix
}

function QrImage({ payload }: { payload: string }) {
  const matrix = useMemo(() => buildQrMatrix(payload), [payload])
  return (
    <svg viewBox="0 0 25 25" className="h-56 w-56 rounded-lg" role="img" aria-label="QR code">
      <rect width="25" height="25" fill="#ffffff" />
      {matrix.map((line, r) =>
        line.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null,
        ),
      )}
    </svg>
  )
}

export default function WhatsappConnection() {
  const navigate = useNavigate()
  const {
    whatsappConnection,
    qrPayload,
    startWhatsappPairing,
    refreshWhatsappQr,
    completeWhatsappPairing,
    disconnectWhatsapp,
  } = useChat()

  const { status } = whatsappConnection
  const [secondsLeft, setSecondsLeft] = useState(QR_EXPIRATION_SECONDS)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Contagem regressiva ativa apenas nos estados disconnected/waiting (QR na tela)
  const qrOnScreen = status !== 'connected'
  useEffect(() => {
    if (!qrOnScreen) return
    setSecondsLeft(QR_EXPIRATION_SECONDS)
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [qrOnScreen, qrPayload])

  const qrExpired = secondsLeft <= 0

  const handleRefreshQr = useCallback(() => {
    if (status === 'disconnected') {
      startWhatsappPairing()
      toast.info('Novo QR code gerado. Aguardando a leitura…')
      return
    }
    refreshWhatsappQr()
    toast.info('QR code atualizado. Gere um novo pareamento no celular se necessário.')
  }, [status, startWhatsappPairing, refreshWhatsappQr])

  const handleSimulateScan = useCallback(() => {
    if (qrExpired) {
      toast.error('O QR code expirou. Atualize o código antes de simular a leitura.')
      return
    }
    completeWhatsappPairing()
  }, [qrExpired, completeWhatsappPairing])

  const handleConfirmDisconnect = useCallback(() => {
    setConfirmOpen(false)
    disconnectWhatsapp()
    setSecondsLeft(QR_EXPIRATION_SECONDS)
    toast.success('Sessão encerrada. Um novo QR code será gerado ao parear novamente.')
  }, [disconnectWhatsapp])

  const connectedDate = whatsappConnection.connectedAt
    ? new Date(whatsappConnection.connectedAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const steps = [
    'Abra o WhatsApp no seu celular',
    'Toque em Aparelhos conectados',
    'Toque em Conectar aparelho e aponte para este código',
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Cabeçalho da página */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              Conexão do WhatsApp
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Escaneie o QR code para conectar seu número ao chatbot PortoPlan.
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-[11px] gap-1.5',
              status === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300',
              )}
            />
            {status === 'connected' ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Estado: Conectado */}
        {status === 'connected' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-800">Sessão ativa</h2>
                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-[11px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Este número está conectado ao chatbot PortoPlan.
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="gap-2">
                <LogOut className="h-4 w-4" />
                Desconectar
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  Número conectado
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {whatsappConnection.phone ?? '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  <MonitorSmartphone className="h-3.5 w-3.5" />
                  Dispositivo
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {whatsappConnection.device ?? '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Conectado em
                </div>
                <p className="text-sm font-semibold text-slate-800">{connectedDate ?? '—'}</p>
              </div>
            </div>

            {/* Botões discretos de teste — reiniciar sessão para testar os estados */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleConfirmDisconnect}
                className="text-slate-400 hover:text-slate-600 text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Simular nova sessão (voltar ao aguardando)
              </Button>
            </div>
          </div>
        ) : (
          /* Estados: Desconectado + Aguardando leitura */
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 shrink-0 mx-auto sm:mx-0">
                <div
                  className={cn(
                    'relative rounded-2xl border p-4 transition',
                    status === 'waiting'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white',
                    qrExpired && 'opacity-40 grayscale',
                  )}
                >
                  <QrImage payload={qrPayload} />
                  {status === 'waiting' && !qrExpired && (
                    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-[1px]">
                      <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-medium text-slate-600">
                        Aguardando leitura do QR code…
                      </p>
                    </div>
                  )}
                  {qrExpired && (
                    <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/90">
                      <p className="text-xs font-semibold text-slate-600">O QR code expirou.</p>
                      <Button size="sm" onClick={handleRefreshQr} className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Gerar novo código
                      </Button>
                    </div>
                  )}
                </div>

                {/* Contagem / barra de expiração */}
                <div className="w-56 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{qrExpired ? 'Código expirado' : 'O QR code expira em'}</span>
                    <span className="font-semibold text-slate-500 tabular-nums">
                      {qrExpired ? '—' : `0:${String(secondsLeft).padStart(2, '0')}`}
                    </span>
                  </div>
                  <Progress value={(secondsLeft / QR_EXPIRATION_SECONDS) * 100} className="h-1.5" />
                </div>

                {!qrExpired ? (
                  <Button onClick={handleRefreshQr} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar QR code
                  </Button>
                ) : null}
              </div>

              {/* Instruções passo a passo */}
              <div className="flex-1 space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Como parear seu WhatsApp</h2>
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 leading-6">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-5">
                    Cada QR code é válido por aproximadamente {QR_EXPIRATION_SECONDS} segundos. Se
                    expirar, clique em “Atualizar QR code” para gerar um novo.
                  </p>
                </div>

                {/* Ações de teste (simulação) */}
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Modo de teste (simulação)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSimulateScan} className="gap-1.5">
                      <Play className="h-3.5 w-3.5" />
                      Simular leitura do QR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefreshQr}
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reiniciar aguardando
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 leading-5">
                    Estes botões existem apenas para você testar os estados da conexão nesta versão
                    demonstrativa — nenhum dado real é enviado ao WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sobre a conexão */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Sobre a conexão</h2>
              <p className="text-sm text-slate-500 leading-6 mt-1">
                Nesta versão, o pareamento do WhatsApp é uma{' '}
                <span className="font-medium text-slate-700">simulação</span>: os estados, o QR code
                e a sessão exibida são dados de exemplo, mantidos apenas em memória. A integração
                real com a API não oficial do WhatsApp (bot.portoplan.com.br) será ativada quando
                houver um servidor intermediário conectado ao projeto — a estrutura de conexão já
                está preparada para receber essa API sem mudar a interface.
              </p>
              <button
                type="button"
                onClick={() => navigate('/inbox')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-2"
              >
                Ir para o Inbox →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmação de desconexão */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Encerrar sessão do WhatsApp?</DialogTitle>
            <DialogDescription>
              O número {whatsappConnection.phone ?? ''} será desconectado do chatbot e as conversas
              deixarão de ser recebidas até que um novo pareamento seja feito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDisconnect}>
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
