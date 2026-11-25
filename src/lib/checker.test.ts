import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseTable } from './parseTable'
import { buildMatcher, findAll } from './matcher'
import { fixParticle, replaceRanges } from './particle'

const terms = parseTable(readFileSync(new URL('../../public/sunhwa.csv', import.meta.url), 'utf8'))
const m = buildMatcher(terms)
const found = (t: string) => findAll(t, m).map((h) => t.slice(h.start, h.end))

describe('목록 읽기', () => {
  it('CSV 기본 목록을 읽는다', () => {
    expect(terms.length).toBeGreaterThan(40)
    expect(terms[0]).toMatchObject({ target: '로드맵', replacement: '이행안, 단계별 계획' })
  })
  it('엑셀에서 복사한 탭 구분 자료를 머리글 순서와 관계없이 읽는다', () => {
    const r = parseTable('순화어\t대상어\t유형\n지침\t가이드라인\t외래어')
    expect(r[0]).toMatchObject({ target: '가이드라인', replacement: '지침', kind: '외래어' })
  })
})

describe('찾기', () => {
  it('조사가 붙어도 대상어만 찾는다', () => expect(found('로드맵을 발표')).toEqual(['로드맵']))
  it('띄어쓰기가 달라도 찾는다', () => expect(found('가이드 라인과 마스터 플랜')).toEqual(['가이드 라인', '마스터 플랜']))
  it('긴 표현을 먼저 찾는다', () => {
    const mm = buildMatcher(parseTable('대상어,순화어\n플랜,계획\n마스터플랜,종합 계획'))
    expect(findAll('마스터플랜', mm).map((h) => h.term.replacement)).toEqual(['종합 계획'])
  })
  it('영문 약어는 단어 경계를 본다', () => expect(found('TF팀, TFT, r&d, MOU를')).toEqual(['TF', 'r&d', 'MOU']))
  it('두 글자 말은 단어 앞에서만 찾는다', () => expect(found('금일 지금일')).toEqual(['금일']))
})

describe('조사 맞추기', () => {
  it.each([
    ['기반 시설', '를 ', '을 '], ['쟁점', '가 ', '이 '], ['전망', '와 ', '과 '],
    ['기반 시설', '로 ', '로 '], ['지침', '로 ', '으로 '], ['누리집', '에서', '에서'], ['의제', '이 ', '가 '],
  ])('%s + %s', (w, a, e) => expect(fixParticle(w, a)).toBe(e))
  it('여러 곳을 한꺼번에 바꾼다', () => {
    const t = '인프라를 늘리고 인프라가 낡았다'
    expect(replaceRanges(t, findAll(t, m), '기반 시설')).toBe('기반 시설을 늘리고 기반 시설이 낡았다')
  })
})
