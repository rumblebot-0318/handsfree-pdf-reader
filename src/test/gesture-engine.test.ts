import test from 'node:test'
import assert from 'node:assert/strict'
import { inferGesture, type FacePoint } from '../core/gesture-engine'
import { DEFAULT_GESTURE_CONFIG } from '../core/defaults'

function createLandmarks(): FacePoint[] {
  return Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5 }))
}

function setEye(points: FacePoint[], indexes: number[], ratio: number, centerX: number) {
  points[indexes[0]] = { x: centerX - 0.1, y: 0.5 }
  points[indexes[3]] = { x: centerX + 0.1, y: 0.5 }
  const vertical = ratio * 0.2
  points[indexes[1]] = { x: centerX - 0.03, y: 0.5 - vertical / 2 }
  points[indexes[5]] = { x: centerX - 0.03, y: 0.5 + vertical / 2 }
  points[indexes[2]] = { x: centerX + 0.03, y: 0.5 - vertical / 2 }
  points[indexes[4]] = { x: centerX + 0.03, y: 0.5 + vertical / 2 }
}

function prepareBaseFace() {
  const points = createLandmarks()
  points[234] = { x: 0.3, y: 0.5 }
  points[454] = { x: 0.7, y: 0.5 }
  points[1] = { x: 0.5, y: 0.45 }
  setEye(points, [33, 160, 158, 133, 153, 144], 0.55, 0.38)
  setEye(points, [362, 385, 387, 263, 373, 380], 0.55, 0.62)
  return points
}

test('detects left wink and maps to previous page', () => {
  const landmarks = prepareBaseFace()
  setEye(landmarks, [33, 160, 158, 133, 153, 144], 0.1, 0.38)
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now() - 5000,
  })

  assert.ok(gesture)
  assert.equal(gesture?.label, 'Left wink')
  assert.equal(gesture?.action, 'prev')
})

test('detects right wink and maps to next page', () => {
  const landmarks = prepareBaseFace()
  setEye(landmarks, [362, 385, 387, 263, 373, 380], 0.1, 0.62)
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now() - 5000,
  })

  assert.ok(gesture)
  assert.equal(gesture?.label, 'Right wink')
  assert.equal(gesture?.action, 'next')
})

test('detects head turn right as next page', () => {
  const landmarks = prepareBaseFace()
  landmarks[1] = { x: 0.64, y: 0.45 }
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now() - 5000,
  })

  assert.ok(gesture)
  assert.equal(gesture?.label, 'Head right')
  assert.equal(gesture?.action, 'next')
})

test('detects head turn left as previous page', () => {
  const landmarks = prepareBaseFace()
  landmarks[1] = { x: 0.36, y: 0.45 }
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now() - 5000,
  })

  assert.ok(gesture)
  assert.equal(gesture?.label, 'Head left')
  assert.equal(gesture?.action, 'prev')
})

test('cooldown suppresses repeated triggers', () => {
  const landmarks = prepareBaseFace()
  setEye(landmarks, [362, 385, 387, 263, 373, 380], 0.1, 0.62)
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now(),
  })

  assert.equal(gesture, null)
})

test('neutral face produces no gesture', () => {
  const landmarks = prepareBaseFace()
  const gesture = inferGesture({
    landmarks,
    config: DEFAULT_GESTURE_CONFIG,
    lastTriggeredAt: Date.now() - 5000,
  })

  assert.equal(gesture, null)
})
