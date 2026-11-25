/** 이 브라우저에서만 쓰는 목록 덮어쓰기. 저장이 막힌 환경에서도 오류 없이 동작한다. */
const KEY = 'sunhwa-data'
export const loadOverride = (): string | null => { try { return localStorage.getItem(KEY) } catch { return null } }
export const saveOverride = (v: string | null) => { try { v == null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v) } catch { /* 무시 */ } }
