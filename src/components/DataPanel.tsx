import { useEffect, useState } from 'react'
import { parseTable } from '../lib/parseTable'

interface Props { count: number; current: string; onApply: (text: string) => void; onDefault: () => void }

export function DataPanel({ count, current, onApply, onDefault }: Props) {
  const [value, setValue] = useState(current)
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null)
  useEffect(() => setValue(current), [current])

  const apply = () => {
    const n = parseTable(value).length
    if (!n) return setMsg({ text: '읽을 수 있는 행이 없습니다. 대상어와 순화어 열이 있는지 확인하세요.', err: true })
    onApply(value)
    setMsg({ text: `${n}개 표현을 적용했습니다.` })
  }
  return (
    <details className="data">
      <summary>순화어 목록 확인·바꾸기 (현재 {count}개)</summary>
      <p>
        엑셀에서 <b>대상어, 순화어, 유형, 출처, 설명</b> 열을 머리글째 복사해 아래에 붙여 넣고 적용하세요. 설명 열은 없어도 됩니다.
        순화어가 여러 개면 쉼표로 구분합니다. 여기서 바꾼 목록은 이 브라우저에만 적용되며, 모든 사용자에게 반영하려면
        <code> public/sunhwa.csv</code> 파일을 같은 형식으로 교체하면 됩니다.
      </p>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} aria-label="순화어 목록" />
      <div className="row">
        <button className="pri" onClick={apply}>목록 적용</button>
        <button onClick={() => { onDefault(); setMsg({ text: '기본 목록으로 되돌렸습니다.' }) }}>기본 목록으로</button>
        {msg && <span className={msg.err ? 'msg err' : 'msg'} aria-live="polite">{msg.text}</span>}
      </div>
    </details>
  )
}
