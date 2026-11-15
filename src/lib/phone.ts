// Utilidades de telefone para os dados vindos da API não oficial do WhatsApp.
//
// A API entrega identificadores crus nos mais variados formatos:
//   - JID de usuário:   "5511999998888@s.whatsapp.net"
//   - JID com device:   "5511999998888:13@s.whatsapp.net"  (o ":13" é o dispositivo)
//   - JID de grupo:     "120363...@g.us"
//   - LID (id opaco):   "162513106821231@lid"
//   - número em E.164:  "+5511999998888"
//   - nacional puro:    "55199620132"
// Tudo isso precisa virar um número legível (ex.: "+55 19 99620-1322") antes de
// ser exibido na lista de conversas, cabeçalho, contatos e kanban.

// Códigos de país conhecidos -> tamanhos válidos da parte local.
// (o dígito após ":" em JIDs de multidispositivo já é descartado no parse,
// então aqui tratamos apenas número de país + número local)
const KNOWN_COUNTRY_CODES: Record<string, number[]> = {
  '1': [10], // EUA / Canadá
  '7': [10], // Rússia / Cazaquistão
  '20': [10],
  '27': [9],
  '30': [10],
  '31': [9],
  '32': [8, 9],
  '33': [9],
  '34': [9],
  '36': [9],
  '39': [9, 10],
  '40': [9],
  '41': [9],
  '43': [10, 11],
  '44': [10],
  '45': [8],
  '46': [9],
  '47': [8],
  '48': [9],
  '49': [10, 11],
  '51': [9],
  '52': [10],
  '53': [8],
  '54': [10],
  '55': [10, 11],
  '56': [9],
  '57': [10],
  '58': [10],
  '60': [9, 10],
  '61': [9],
  '62': [9, 10, 11],
  '63': [10],
  '64': [8, 9, 10],
  '65': [8],
  '66': [9],
  '81': [10],
  '82': [9, 10],
  '84': [9, 10],
  '86': [11],
  '90': [10],
  '91': [10],
  '92': [10],
  '93': [9],
  '94': [9],
  '95': [9, 10],
  '98': [10],
  '212': [9],
  '213': [9],
  '216': [8],
  '218': [9, 10],
  '220': [7],
  '221': [9],
  '233': [9],
  '234': [10],
  '254': [9],
  '258': [9],
  '351': [9],
  '352': [9],
  '353': [9],
  '355': [9],
  '359': [8, 9],
  '370': [8],
  '371': [8],
  '380': [9],
  '420': [9],
  '421': [9],
  '502': [8],
  '503': [8],
  '504': [8],
  '505': [8],
  '506': [8],
  '507': [8],
  '509': [8],
  '590': [9],
  '591': [8],
  '593': [9],
  '595': [9],
  '598': [8, 9],
  '599': [8],
  '852': [8],
  '853': [8],
  '855': [9],
  '856': [9, 10],
  '880': [10],
  '886': [9],
  '961': [7, 8],
  '962': [9],
  '963': [9],
  '964': [10],
  '965': [8],
  '966': [9],
  '971': [9],
  '972': [9],
  '973': [8],
  '974': [8],
  '975': [8],
  '976': [8],
  '977': [10],
  '998': [9],
}

// Remove sufixos de JID (@s.whatsapp.net, @g.us, @lid, @c.us) e o dígito de
// dispositivo (":13") e devolve apenas os dígitos.
export function extractPhoneDigits(raw: string | null | undefined): string {
  if (!raw) return ''
  const beforeAt = raw.split('@')[0] ?? ''
  const beforeDevice = beforeAt.split(':')[0] ?? ''
  return beforeDevice.replace(/\D/g, '')
}

const chunkGroups = (s: string) => (s.match(/.{1,4}/g) ?? [s]).join(' ')

function formatWithCountryCode(code: string, local: string): string {
  // Brasil: "+55 19 99620-1322" (9 dígitos) / "+55 11 98765-4321" (8 dígitos)
  if (code === '55') {
    const ddd = local.slice(0, 2)
    const rest = local.slice(2)
    return `+55 ${ddd} ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`
  }
  // EUA/Canadá: "+1 (625) 131-0682"
  if (code === '1') {
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
  }
  return `+${code} ${chunkGroups(local)}`
}

/**
 * Formata qualquer identificador/número cru para leitura humana.
 * - Já formatado para humanos ("+55 11 98765-4321"): mantém como está.
 * - Reconhecível (código de país + parte local válidos): formata.
 * - Identificador opaco (LID/id interno sem telefone derivável): devolve o
 *   valor original sem inventar formatação.
 */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw) return '—'
  const trimmed = raw.trim()
  if (!trimmed) return '—'

  // Já contém separadores humanos (espaço, hífen, parênteses) e não é JID:
  // é um número já legível — não mexe.
  if (!trimmed.includes('@') && /[^+\d]/.test(trimmed)) return trimmed

  const digits = extractPhoneDigits(trimmed)
  if (!digits) return trimmed

  // Tenta código de país com 3, 2 e 1 dígito, aceitando a parte local
  // apenas nos tamanhos conhecidos — evita "formatar" um LID por engano.
  for (const codeLen of [3, 2, 1]) {
    if (digits.length <= codeLen) break
    const code = digits.slice(0, codeLen)
    const localLengths = KNOWN_COUNTRY_CODES[code]
    if (!localLengths) continue
    const local = digits.slice(codeLen)
    if (localLengths.includes(local.length)) {
      return formatWithCountryCode(code, local)
    }
  }

  return trimmed
}

/** Verdadeiro quando o texto parece um identificador/telefone cru (sem letras). */
export function isRawPhoneIdentifier(value: string | null | undefined): boolean {
  const t = (value ?? '').trim()
  if (!t) return false
  if (/[a-zA-ZÀ-ÿ]/.test(t)) return false
  return /\d{7,}/.test(t.replace(/\D/g, ''))
}

/**
 * Nome de exibição do contato: quando o "nome" veio cru da API (é o próprio
 * número/JID), exibe o telefone formatado no lugar.
 */
export function displayContactName(
  name: string | null | undefined,
  phone: string | null | undefined,
): string {
  const n = (name ?? '').trim()
  if (!n) return formatPhoneDisplay(phone)
  if (isRawPhoneIdentifier(n)) {
    const digits = extractPhoneDigits(phone)
    return digits ? formatPhoneDisplay(phone) : formatPhoneDisplay(n)
  }
  return n
}

/** Texto para busca: casa o valor cru, os dígitos e a versão formatada. */
export function phoneSearchText(raw: string | null | undefined): string {
  const digits = extractPhoneDigits(raw)
  return `${raw ?? ''} ${digits} ${formatPhoneDisplay(raw ?? '')}`.toLowerCase()
}
