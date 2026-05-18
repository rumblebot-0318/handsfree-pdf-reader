import type { GestureConfig, GestureEvent } from './types'

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function eyeRatio(points: { x: number; y: number }[]) {
  const vertical = distance(points[1], points[5]) + distance(points[2], points[4])
  const horizontal = 2 * distance(points[0], points[3])
  return horizontal === 0 ? 1 : vertical / horizontal
}

export function inferGesture(params: {
  landmarks: { x: number; y: number }[]
  config: GestureConfig
  lastTriggeredAt: number
}): GestureEvent | null {
  const { landmarks, config, lastTriggeredAt } = params
  const now = Date.now()
  if (now - lastTriggeredAt < config.cooldownMs) return null
  if (landmarks.length < 468) return null

  const leftEye = [33, 160, 158, 133, 153, 144].map((i) => landmarks[i])
  const rightEye = [362, 385, 387, 263, 373, 380].map((i) => landmarks[i])
  const nose = landmarks[1]
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]

  const leftRatio = eyeRatio(leftEye)
  const rightRatio = eyeRatio(rightEye)
  const faceCenterX = (leftCheek.x + rightCheek.x) / 2
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 1
  const normalizedYaw = (nose.x - faceCenterX) / faceWidth

  if (leftRatio < config.winkThreshold && rightRatio > config.winkThreshold + 0.04) {
    return {
      label: 'Left wink',
      action: config.leftWinkAction,
      confidence: Math.max(0, 1 - leftRatio / config.winkThreshold),
      timestamp: now,
    }
  }

  if (rightRatio < config.winkThreshold && leftRatio > config.winkThreshold + 0.04) {
    return {
      label: 'Right wink',
      action: config.rightWinkAction,
      confidence: Math.max(0, 1 - rightRatio / config.winkThreshold),
      timestamp: now,
    }
  }

  if (normalizedYaw > config.yawThreshold) {
    return {
      label: 'Head right',
      action: 'next',
      confidence: Math.min(1, normalizedYaw / (config.yawThreshold * 1.8)),
      timestamp: now,
    }
  }

  if (normalizedYaw < -config.yawThreshold) {
    return {
      label: 'Head left',
      action: 'prev',
      confidence: Math.min(1, Math.abs(normalizedYaw) / (config.yawThreshold * 1.8)),
      timestamp: now,
    }
  }

  return null
}
