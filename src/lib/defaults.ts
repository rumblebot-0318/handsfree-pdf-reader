import type { GestureConfig } from './types'

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  leftWinkAction: 'prev',
  rightWinkAction: 'next',
  yawThreshold: 0.28,
  winkThreshold: 0.38,
  cooldownMs: 1200,
}
