export type GestureAction = 'next' | 'prev' | 'none'

export interface GestureConfig {
  leftWinkAction: GestureAction
  rightWinkAction: GestureAction
  yawThreshold: number
  winkThreshold: number
  cooldownMs: number
}

export interface GestureEvent {
  label: string
  action: GestureAction
  confidence: number
  timestamp: number
}

export interface ViewerState {
  page: number
  totalPages: number
  scale: number
}

export interface CalibrationProfile {
  neutralYaw: number
  leftWinkAverage: number
  rightWinkAverage: number
}
