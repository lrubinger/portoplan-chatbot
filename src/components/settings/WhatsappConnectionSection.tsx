import { Link } from 'react-router-dom'
import { QrCode, ShieldCheck } from 'lucide-react'

/** In the V2 deployment, authenticated WhatsApp pairing lives in the real backend pilot.
 * Never generate fake QR payloads or claim a connection from in-memory demo state.
 */
export default function WhatsappConnectionSection() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2"><QrCode className="h-5 w-5 text-emerald-600" />Conexão do WhatsApp</h2>
      <p className="text-sm text-slate-600">O pareamento e o estado da sessão são fornecidos pelo servidor PortoPlan. Não são utilizados QR Codes de demonstração.</p>
      <Link to="/integracao-v2" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-medium"><ShieldCheck className="h-4 w-4" />Abrir conexão autenticada</Link>
    </section>
  )
}
