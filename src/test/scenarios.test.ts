import test from 'node:test'
import assert from 'node:assert/strict'
import { manualTestScenarios } from './scenarios'

test('manual scenario list covers core MVP flows', () => {
  const ids = manualTestScenarios.map((scenario: { id: string }) => scenario.id)

  assert.ok(ids.includes('pdf-load-basic'))
  assert.ok(ids.includes('gesture-left-wink'))
  assert.ok(ids.includes('gesture-right-wink'))
  assert.ok(ids.includes('gesture-head-turn'))
  assert.ok(ids.includes('camera-permission-denied'))
  assert.equal(manualTestScenarios.length >= 5, true)
})
