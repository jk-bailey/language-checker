import { useEffect, useMemo, useRef, useState } from 'react'
import { DataPanel } from './components/DataPanel'
import { DetailPanel } from './components/DetailPanel'
import { HighlightedText } from './components/HighlightedText'
import { TermList } from './components/TermList'
import { buildMatcher, findAll, normalize } from './lib/matcher'
import { parseTable } from './lib/parseTable'
import { replaceRanges } from './lib/particle'
import { loadOverride, saveOverride } from './lib/storage'
import { SAMPLE_TEXT } from './sample'

/** 기관 순화어 목록. 이 파일만 바꾸면 모든 사용자에게 반영된다. */
const DATA_URL = `${import.meta.env.BASE_URL}sunhwa.csv`

export default function App() {
  const [defaultData, setDefaultData] = useState('')
  const [dataText, setDataText] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [text, setText] = useState(SAMPLE_TEXT)
  const [checked, setChecked] = useState(true)
  const [selected, setSelected] = useState(-1)
  const [scrollTo, setScrollTo] = useState<number | null>(null)
  const [undo, setUndo] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const srcRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text() })
      .then((t) => { setDefaultData(t); setDataText(loadOverride() ?? t) })
      .catch(() => { setLoadError(true); setDataText(loadOverride() ?? '') })
  }, [])

  const terms = useMemo(() => parseTable(dataText), [dataText])
  const matcher = useMemo(() => buildMatcher(terms), [terms])
  const hits = useMemo(() => (checked ? findAll(text, matcher) : []), [checked, text, matcher])
  const hit = hits[selected] ?? null
  const sameCount = hit ? hits.filter((h) => normalize(h.term.target) === normalize(hit.term.target)).length : 0
  const kinds = new Set(hits.map((h) => normalize(h.term.target))).size

  const check = () => { setChecked(true); setSelected(-1); setNotice('') }
  const edit = () => { setChecked(false); setSelected(-1); setNotice(''); setTimeout(() => srcRef.current?.focus()) }
  const pick = (i: number, scroll = false) => { setSelected(i); setScrollTo(scroll ? i : null) }

  const replace = (word: string, all: boolean) => {
    if (!hit) return
    const targets = all ? hits.filter((h) => normalize(h.term.target) === normalize(hit.term.target)) : [hit]
    const next = replaceRanges(text, targets, word)
    setUndo((u) => [...u, text])
    setText(next)
    const nextHits = findAll(next, matcher)
    const ni = nextHits.findIndex((h) => h.start >= hit.start)
    setSelected(ni)
    setNotice('')
  }
  const doUndo = () => { if (!undo.length) return; setText(undo[undo.length - 1]); setUndo(undo.slice(0, -1)); setSelected(-1) }
  const reset = () => { setText(''); setUndo([]); setSelected(-1); setChecked(false); setNotice(''); setTimeout(() => srcRef.current?.focus()) }
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setNotice('고친 글을 복사했습니다') }
    catch { setNotice('복사가 막혀 있습니다. 글 고치기를 눌러 직접 복사하세요') }
  }

  let status: JSX.Element | string = '글을 붙여 넣으세요'
  if (notice) status = notice
  else if (loadError && !terms.length) status = '순화어 목록을 불러오지 못했습니다'
  else if (checked) status = hits.length ? <>순화 대상 <strong>{hits.length}건</strong> ({kinds}개 표현)</> : '순화 대상 표현이 없습니다'
  else if (text) status = '글을 고친 뒤 검사하세요'

  return (
    <>
      <header><div className="hd">
        <h1>보도자료 <b>순화어</b> 점검</h1>
        <p className="sub">글을 붙여 넣고 검사하면 순화 대상 표현에 밑줄이 그어집니다. 밑줄을 누르면 권장 표현이 나옵니다.</p>
      </div></header>
      <main>
        <section className="sheet" aria-label="원고">
          <div className="bar">
            <span className="st" aria-live="polite">{status}</span>
            {checked && <button onClick={edit}>글 고치기</button>}
            <button onClick={doUndo} disabled={!undo.length}>되돌리기</button>
            {checked && <button onClick={copy}>결과 복사</button>}
            <button onClick={reset}>초기화</button>
            {!checked && <button className="pri" onClick={check}>검사하기</button>}
          </div>
          {checked
            ? <HighlightedText text={text} hits={hits} selected={selected} scrollTo={scrollTo} onSelect={(i) => pick(i)} />
            : <textarea ref={srcRef} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false}
                placeholder="보도자료 본문을 여기에 붙여 넣으세요."
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) check() }} />}
        </section>
        <aside>
          <DetailPanel key={selected} hit={hit} text={text} sameCount={sameCount} onReplace={replace} />
          <TermList hits={checked ? hits : null} onPick={(i) => pick(i, true)} />
        </aside>
        <DataPanel count={terms.length} current={dataText}
          onApply={(t) => { setDataText(t); saveOverride(t); setSelected(-1) }}
          onDefault={() => { saveOverride(null); setDataText(defaultData); setSelected(-1) }} />
        <p className="note">기본 목록은 시연용 예시 자료입니다. 실제 운영 시 기관 제공 순화어 목록으로 바꿔 사용합니다.</p>
      </main>
    </>
  )
}
