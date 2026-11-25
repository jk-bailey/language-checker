import { useState } from 'react'
import { splitSuggestions } from '../lib/parseTable'
import type { Hit } from '../lib/types'

interface Props { hit: Hit | null; text: string; sameCount: number; onReplace: (word: string, all: boolean) => void }

export function DetailPanel({ hit, text, sameCount, onReplace }: Props) {
  const [all, setAll] = useState(false)
  if (!hit) {
    return (
      <div className="card det" aria-live="polite">
        <h2>선택한 표현</h2>
        <p className="empty">밑줄 친 표현을 누르면 권장 순화어와 설명이 여기에 나옵니다.</p>
      </div>
    )
  }
  const { term } = hit
  return (
    <div className="card det" aria-live="polite">
      <h2>선택한 표현</h2>
      <p className="from">대상어</p>
      <p className="word">{text.slice(hit.start, hit.end)}</p>
      <p className="from">권장 순화어 (누르면 바꿉니다)</p>
      <div className="chips">
        {splitSuggestions(term.replacement).map((s) => (
          <button key={s} onClick={() => onReplace(s, all && sameCount > 1)}>{s}</button>
        ))}
      </div>
      <p className="hint">바꿀 때 뒤에 붙은 조사(을/를, 이/가 등)도 함께 맞춥니다.</p>
      {sameCount > 1 && (
        <label className="chk">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> 같은 표현 {sameCount}건 모두 바꾸기
        </label>
      )}
      <dl>
        <dt>유형</dt><dd>{term.kind || '-'}</dd>
        <dt>출처</dt><dd>{term.source || '-'}</dd>
        {term.note && (<><dt>설명</dt><dd>{term.note}</dd></>)}
      </dl>
    </div>
  )
}
