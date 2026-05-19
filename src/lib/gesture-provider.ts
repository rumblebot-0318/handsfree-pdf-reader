import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs-core'

const VISION_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export type GestureProviderKind = 'desktop-mediapipe' | 'mobile-tfjs'

export interface MobileTfjsDetector {
  estimateFaces(input: HTMLVideoElement): Promise<Array<{ keypoints: Array<{ x: number; y: number }> }>>
}

export function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function selectGestureProvider(): GestureProviderKind {
  return isMobileDevice() ? 'mobile-tfjs' : 'desktop-mediapipe'
}

export async function createDesktopMediaPipeDetector() {
  const vision = await FilesetResolver.forVisionTasks(VISION_BASE)
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
  })
}

export async function createMobileTfjsDetector(): Promise<MobileTfjsDetector> {
  await tf.setBackend('webgl')
  await tf.ready()

  return faceLandmarksDetection.createDetector(faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh, {
    runtime: 'tfjs',
    refineLandmarks: false,
    maxFaces: 1,
  })
}
