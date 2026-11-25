/** 마지막 글자의 받침 번호(0 = 받침 없음). 한글이 아니면 null. */
function jongIndex(word: string): number | null {
  const c = word.trim().slice(-1).charCodeAt(0)
  if (c < 0xac00 || c > 0xd7a3) return null
  return (c - 0xac00) % 28
}

/** 새 낱말에 맞게 바로 뒤의 조사를 고친다(을/를, 은/는, 과/와, 이/가, 으로/로). */
export function fixParticle(word: string, after: string): string {
  const j = jongIndex(word)
  if (j === null) return after
  const jong = j > 0
  const rieul = j === 8
  const endsWord = (i: number) => !/[가-힣]/.test(after[i] ?? '')
  for (const [a, z] of [['을', '를'], ['은', '는'], ['과', '와']]) {
    if (after[0] === a || after[0] === z) return (jong ? a : z) + after.slice(1)
  }
  if (after.startsWith('으로')) return (jong && !rieul ? '으로' : '로') + after.slice(2)
  if (after[0] === '로' && endsWord(1)) return (jong && !rieul ? '으로' : '로') + after.slice(1)
  if (after[0] === '가' && endsWord(1) && jong) return '이' + after.slice(1)
  if (after[0] === '이' && endsWord(1) && !jong) return '가' + after.slice(1)
  return after
}

/** 본문의 여러 위치를 한꺼번에 바꾼다. 뒤에서부터 바꿔 위치가 어긋나지 않게 한다. */
export function replaceRanges(text: string, ranges: { start: number; end: number }[], word: string): string {
  let t = text
  for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
    const after = fixParticle(word, t.slice(r.end, r.end + 3))
    t = t.slice(0, r.start) + word + after + t.slice(r.end + 3)
  }
  return t
}
