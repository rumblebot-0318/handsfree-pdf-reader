import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import { DEFAULT_GESTURE_CONFIG } from '../core/defaults'
import { inferGesture } from '../core/gesture-engine'
import type { GestureConfig, GestureEvent } from '../types'

const VISION_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

type InitStage = 'idle' | 'camera-starting' | 'camera-live' | 'vision-loading' | 'vision-live' | 'vision-failed'

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function normalizeMediaError(err: unknown) {
  if (!(err instanceof Error)) return 'Failed to start gesture control'
  if (err.name === 'NotAllowedError') return 'Camera permission was denied or blocked by the browser.'
  if (err.name === 'NotReadableError') return 'Camera is busy in another app or tab.'
  if (err.name === 'OverconstrainedError') return 'Requested camera settings are not supported on this device.'
  if (err.name === 'NotFoundError') return 'No compatible camera was found on this device.'
  return err.message || 'Failed to start gesture control'
}

async function requestCameraStream() {
  const mobile = isMobileDevice()
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: 'user',
        width: { ideal: mobile ? 640 : 960 },
        height: { ideal: mobile ? 480 : 540 },
      },
      audio: false,
    },
    {
      video: {
        width: { ideal: mobile ? 640 : 960 },
        height: { ideal: mobile ? 480 : 540 },
      },
      audio: false,
    },
    { video: true, audio: false },
  ]

  let lastError: unknown = null
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}

export function useGestureController(onGesture: (event: GestureEvent) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectorRef = useRef<FaceLandmarker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastTriggeredAtRef = useRef(0)

  const [config, setConfig] = useState<GestureConfig>(DEFAULT_GESTURE_CONFIG)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null)
  const [initStage, setInitStage] = useState<InitStage>('idle')

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    setIsRunning(false)
    setInitStage('idle')
  }, [])

  const detectLoop = useCallback(() => {
    const video = videoRef.current
    const detector = detectorRef.current
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }

    const result = detector.detectForVideo(video, performance.now())
    const landmarks = result.faceLandmarks?.[0]
    if (landmarks) {
      const gesture = inferGesture({
        landmarks,
        config,
        lastTriggeredAt: lastTriggeredAtRef.current,
      })
      if (gesture && gesture.action !== 'none') {
        lastTriggeredAtRef.current = gesture.timestamp
        setLastGesture(gesture)
        onGesture(gesture)
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop)
  }, [config, onGesture])

  const start = useCallback(async () => {
    if (isRunning) return
    setError(null)
    setIsLoading(true)
    setInitStage('camera-starting')

    try {
      const stream = await requestCameraStream()
      streamRef.current = stream

      if (!videoRef.current) throw new Error('Video element unavailable')
      videoRef.current.srcObject = stream
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      await videoRef.current.play()
      setIsRunning(true)
      setInitStage('camera-live')

      try {
        setInitStage('vision-loading')
        const vision = await FilesetResolver.forVisionTasks(VISION_BASE)
        detectorRef.current ??= await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
        })
        setInitStage('vision-live')
        rafRef.current = requestAnimationFrame(detectLoop)
      } catch (visionError) {
        setInitStage('vision-failed')
        setError(`Camera is live, but gesture model failed to load. ${normalizeMediaError(visionError)}`)
      }
    } catch (err) {
      setError(normalizeMediaError(err))
      setIsRunning(false)
      setInitStage('idle')
    } finally {
      setIsLoading(false)
    }
  }, [detectLoop, isRunning])

  useEffect(() => stop, [stop])

  const controls = useMemo(
    () => ({ config, setConfig, isRunning, isLoading, error, lastGesture, start, stop, initStage }),
    [config, isRunning, isLoading, error, lastGesture, start, stop, initStage],
  )

  return { videoRef, ...controls }
}
