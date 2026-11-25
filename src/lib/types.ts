/** 순화어 목록 한 줄 */
export interface Term {
  /** 대상어 */ target: string
  /** 순화어 (쉼표로 여러 개) */ replacement: string
  /** 유형 */ kind: string
  /** 출처 */ source: string
  /** 설명 */ note: string
}

/** 본문에서 찾은 위치 */
export interface Hit {
  start: number
  end: number
  term: Term
}
