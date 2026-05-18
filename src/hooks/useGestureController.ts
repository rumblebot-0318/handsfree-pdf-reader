import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import { DEFAULT_GESTURE_CONFIG } from '../core/defaults'
import { inferGesture } from '../core/gesture-engine'
import type { GestureConfig, GestureEvent } from '../types'

const VISION_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

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

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsRunning(false)
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

    try {
      const vision = await FilesetResolver.forVisionTasks(VISION_BASE)
      detectorRef.current ??= await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } },
        audio: false,
      })

      streamRef.current = stream
      if (!videoRef.current) throw new Error('Video element unavailable')
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setIsRunning(true)
      rafRef.current = requestAnimationFrame(detectLoop)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start gesture control')
    } finally {
      setIsLoading(false)
    }
  }, [detectLoop, isRunning])

  useEffect(() => stop, [stop])

  const controls = useMemo(
    () => ({ config, setConfig, isRunning, isLoading, error, lastGesture, start, stop }),
    [config, isRunning, isLoading, error, lastGesture, start, stop],
  )

  return { videoRef, ...controls }
}
