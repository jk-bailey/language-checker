import { Fragment, useEffect, useRef } from 'react'
import type { Hit } from '../lib/types'

interface Props { text: string; hits: Hit[]; selected: number; scrollTo: number | null; onSelect: (i: number) => void }

export function HighlightedText({ text, hits, selected, scrollTo, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollTo == null) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.querySelector(`mark[data-i="${scrollTo}"]`)?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [scrollTo])

  if (!text) return <div className="doc"><span className="empty">검사할 글이 없습니다.</span></div>
  const parts: JSX.Element[] = []
  let p = 0
  hits.forEach((h, i) => {
    parts.push(<Fragment key={`t${i}`}>{text.slice(p, h.start)}</Fragment>)
    parts.push(
      <mark key={`m${i}`} data-i={i} tabIndex={0} className={i === selected ? 'on' : undefined}
        title={`${h.term.target} → ${h.term.replacement}`}
        onClick={() => onSelect(i)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i) } }}>
        {text.slice(h.start, h.end)}
      </mark>,
    )
    p = h.end
  })
  parts.push(<Fragment key="end">{text.slice(p)}</Fragment>)
  return <div className="doc" ref={ref}>{parts}</div>
}
