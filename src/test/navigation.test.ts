import test from 'node:test'
import assert from 'node:assert/strict'
import { applyGestureToViewer } from '../core/navigation'
import type { ViewerState } from '../types'

const baseState: ViewerState = {
  page: 3,
  totalPages: 10,
  scale: 1.25,
}

test('next gesture increments page', () => {
  const next = applyGestureToViewer(baseState, 'next')
  assert.equal(next.page, 4)
})

test('prev gesture decrements page', () => {
  const next = applyGestureToViewer(baseState, 'prev')
  assert.equal(next.page, 2)
})

test('next gesture does not exceed total pages', () => {
  const next = applyGestureToViewer({ ...baseState, page: 10 }, 'next')
  assert.equal(next.page, 10)
})

test('prev gesture does not go below page 1', () => {
  const next = applyGestureToViewer({ ...baseState, page: 1 }, 'prev')
  assert.equal(next.page, 1)
})

test('none gesture preserves page', () => {
  const next = applyGestureToViewer(baseState, 'none')
  assert.equal(next.page, 3)
})
