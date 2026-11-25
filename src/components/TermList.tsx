import { normalize } from '../lib/matcher'
import type { Hit, Term } from '../lib/types'

interface Props { hits: Hit[] | null; onPick: (i: number) => void }

export function TermList({ hits, onPick }: Props) {
  const groups = new Map<string, { term: Term; n: number; first: number }>()
  hits?.forEach((h, i) => {
    const k = normalize(h.term.target)
    const g = groups.get(k)
    if (g) g.n++
    else groups.set(k, { term: h.term, n: 1, first: i })
  })
  return (
    <div className="card">
      <h2>{hits ? `찾은 표현 ${groups.size}개` : '찾은 표현'}</h2>
      <ul className="list">
        {!hits && <li className="empty">아직 검사하지 않았습니다.</li>}
        {hits && !groups.size && <li className="empty">찾은 표현이 없습니다.</li>}
        {[...groups.values()].map((g) => (
          <li key={g.first}>
            <button onClick={() => onPick(g.first)}>
              <span className="l1">{g.term.target}</span>
              <span className="l2">→ {g.term.replacement}</span>
              <span className="n">{g.n}건</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
