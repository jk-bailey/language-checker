import type { Hit, Term } from './types'

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase()

export interface Matcher { re: RegExp; map: Map<string, Term> }

/**
 * 일치 규칙
 * - 긴 표현을 먼저 찾는다(최장 일치).
 * - 한글 3자 이상은 띄어쓰기 차이를 허용한다(가이드 라인 = 가이드라인).
 * - 2자 이하 한글은 단어 앞에서만 찾는다(지금일 속 '금일' 제외).
 * - 영문은 앞뒤가 영문이 아닐 때만 찾는다(TF팀 O, TFT X).
 * - 뒤에 붙은 조사는 그대로 두고 대상어만 표시한다(로드맵을 → '로드맵').
 */
export function buildMatcher(terms: Term[]): Matcher | null {
  const map = new Map<string, Term>()
  for (const t of terms) {
    const k = normalize(t.target)
    if (k && !map.has(k)) map.set(k, t)
  }
  const keys = [...map.keys()].sort((a, b) => b.length - a.length)
  if (!keys.length) return null
  const parts = keys.map((k) => {
    const latin = /[a-z]/.test(k)
    const chars = [...k]
    let p = !latin && chars.length >= 3 ? chars.map(esc).join('\\s?') : esc(k)
    if (latin) p = `(?<![A-Za-z0-9])${p}(?![A-Za-z])`
    else if (chars.length <= 2) p = `(?<![가-힣])${p}`
    return p
  })
  return { re: new RegExp(parts.join('|'), 'gi'), map }
}

export function findAll(text: string, m: Matcher | null): Hit[] {
  const hits: Hit[] = []
  if (!m) return hits
  const re = new RegExp(m.re.source, m.re.flags)
  let x: RegExpExecArray | null
  while ((x = re.exec(text))) {
    const term = m.map.get(normalize(x[0]))
    if (term) hits.push({ start: x.index, end: x.index + x[0].length, term })
  }
  return hits
}
