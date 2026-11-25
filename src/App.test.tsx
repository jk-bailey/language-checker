// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'

const csv = readFileSync('public/sunhwa.csv', 'utf8')
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(csv)))
  window.matchMedia = (() => ({ matches: true })) as never
  Element.prototype.scrollIntoView = () => {}
})
afterEach(cleanup)

it('예시 글을 검사하고, 밑줄을 눌러 순화어로 바꾼다', async () => {
  const { container } = render(<App />)
  await waitFor(() => expect(container.querySelectorAll('mark').length).toBeGreaterThan(10))
  expect(container.querySelector('.st')!.textContent).toMatch(/순화 대상 \d+건/)
  fireEvent.click(container.querySelector('mark')!)
  expect(screen.getByText('기반 시설')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '기반 시설' }))
  expect(container.querySelector('.doc')!.textContent).toContain('도시 기반 시설 개선')
  fireEvent.click(screen.getByRole('button', { name: '되돌리기' }))
  expect(container.querySelector('.doc')!.textContent).toContain('도시 인프라 개선')
})

it('초기화하면 빈 입력칸으로 돌아간다', async () => {
  const { container } = render(<App />)
  await waitFor(() => expect(container.querySelector('mark')).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: '초기화' }))
  expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('')
  expect(screen.getByRole('button', { name: '검사하기' })).toBeTruthy()
})
