import type { GestureAction, ViewerState } from '../types'

export function applyGestureToViewer(state: ViewerState, action: GestureAction): ViewerState {
  if (action === 'next') {
    return { ...state, page: Math.min(state.totalPages, state.page + 1) }
  }
  if (action === 'prev') {
    return { ...state, page: Math.max(1, state.page - 1) }
  }
  return state
}
