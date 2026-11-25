import type { Term } from './types'

/** 엑셀에서 복사한 탭 구분 자료, CSV, `|` 구분 자료를 모두 읽는다. 첫 줄에 '대상어'가 있으면 머리글로 본다. */
export function parseTable(text: string): Term[] {
  const lines = text.replace(/^﻿/, '').replace(/\r/g, '').split('\n').filter((l) => l.trim())
  if (!lines.length) return []
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes('|') ? '|' : ','
  let rows = lines.map((l) => (sep === ',' ? splitCsv(l) : l.split(sep).map((s) => s.trim())))
  let idx = { t: 0, s: 1, k: 2, o: 3, d: 4 }
  const head = rows[0].map((h) => h.replace(/\s/g, ''))
  if (head.some((h) => h.includes('대상어'))) {
    const f = (re: RegExp) => head.findIndex((h) => re.test(h))
    idx = { t: f(/대상어/), s: f(/순화어|권장/), k: f(/유형/), o: f(/출처/), d: f(/설명|비고/) }
    rows = rows.slice(1)
  }
  const g = (r: string[], i: number) => (i >= 0 && r[i] ? r[i] : '')
  return rows
    .map((r) => ({ target: g(r, idx.t), replacement: g(r, idx.s), kind: g(r, idx.k), source: g(r, idx.o), note: g(r, idx.d) }))
    .filter((r) => r.target && r.replacement)
}

function splitCsv(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') quoted = false
      else cur += c
    } else if (c === '"') quoted = true
    else if (c === ',') { out.push(cur.trim()); cur = '' }
    else cur += c
  }
  out.push(cur.trim())
  return out
}

/** 권장 순화어 문자열을 낱개로 나눈다. */
export const splitSuggestions = (s: string) => s.split(/[,，、]/).map((x) => x.trim()).filter(Boolean)
