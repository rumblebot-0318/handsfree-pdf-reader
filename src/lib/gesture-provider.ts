import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import * as faceDetection from '@tensorflow-models/face-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs-core'

const VISION_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export type GestureProviderKind = 'desktop-mediapipe' | 'mobile-tfjs-face-detection'

export interface MobileTfjsDetector {
  estimateFaces(input: HTMLVideoElement): Promise<Array<{ box?: { xMin: number; yMin: number; width: number; height: number } }>>
}

export function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function selectGestureProvider(): GestureProviderKind {
  return isMobileDevice() ? 'mobile-tfjs-face-detection' : 'desktop-mediapipe'
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
  const backends = ['webgl', 'cpu'] as const
  let lastError: unknown = null

  for (const backend of backends) {
    try {
      await tf.setBackend(backend)
      await tf.ready()
      return await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
        runtime: 'tfjs',
        modelType: 'short',
        maxFaces: 1,
      })
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
