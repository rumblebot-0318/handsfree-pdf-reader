import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import { DEFAULT_GESTURE_CONFIG } from '../core/defaults'
import { inferGesture } from '../core/gesture-engine'
import { createDesktopMediaPipeDetector, createMobileTfjsDetector, isMobileDevice, type MobileTfjsDetector, selectGestureProvider } from '../lib/gesture-provider'
import type { GestureConfig, GestureEvent } from '../types'

type InitStage = 'idle' | 'camera-starting' | 'camera-live' | 'vision-loading' | 'vision-live' | 'vision-failed'
type Detector = FaceLandmarker | MobileTfjsDetector

function normalizeMediaError(err: unknown) {
  if (!(err instanceof Error)) return 'Failed to start gesture control'
  if (err.name === 'NotAllowedError') return 'Camera permission was denied or blocked by the browser.'
  if (err.name === 'NotReadableError') return 'Camera is busy in another app or tab.'
  if (err.name === 'OverconstrainedError') return 'Requested camera settings are not supported on this device.'
  if (err.name === 'NotFoundError') return 'No compatible camera was found on this device.'
  if (err.name === 'AbortError') return 'Camera startup was interrupted by the browser.'
  return err.message || 'Failed to start gesture control'
}

function normalizeVisionError(err: unknown) {
  if (!(err instanceof Error)) return 'Gesture model failed to initialize.'
  if (/fetch|network|failed to fetch/i.test(err.message)) return 'Gesture model assets could not be downloaded on this network.'
  if (/memory|heap|allocation|wasm/i.test(err.message)) return 'Gesture model ran out of device memory or WebAssembly resources.'
  return err.message || 'Gesture model failed to initialize.'
}

async function requestCameraStream(facingMode: 'user' | 'environment') {
  const mobile = isMobileDevice()
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode,
        width: { ideal: mobile ? 960 : 960 },
        height: { ideal: mobile ? 720 : 540 },
      },
      audio: false,
    },
    {
      video: {
        facingMode,
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
  const detectorRef = useRef<Detector | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastTriggeredAtRef = useRef(0)
  const detectEveryMsRef = useRef(isMobileDevice() ? 220 : 0)
  const lastDetectionAtRef = useRef(0)
  const lastFaceCountRef = useRef(0)
  const lastKeypointCountRef = useRef(0)

  const [config, setConfig] = useState<GestureConfig>(DEFAULT_GESTURE_CONFIG)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null)
  const [debugLines, setDebugLines] = useState<string[]>([])
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user')
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

  const handleLandmarks = useCallback((landmarks?: { x: number; y: number }[]) => {
    if (!landmarks || landmarks.length < 468) {
      const video = videoRef.current
      const width = video?.videoWidth ?? 0
      const height = video?.videoHeight ?? 0
      const readyState = video?.readyState ?? 0
      setDebugLines((prev) => [
        `landmarks: unavailable video=${width}x${height} ready=${readyState} faces=${lastFaceCountRef.current} keypoints=${lastKeypointCountRef.current}`,
        ...prev.slice(0, 7),
      ])
      return
    }

    const leftEye = [33, 160, 158, 133, 153, 144].map((i) => landmarks[i])
    const rightEye = [362, 385, 387, 263, 373, 380].map((i) => landmarks[i])
    const leftCheek = landmarks[234]
    const rightCheek = landmarks[454]
    const nose = landmarks[1]
    const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
    const eyeRatio = (points: { x: number; y: number }[]) => {
      const vertical = distance(points[1], points[5]) + distance(points[2], points[4])
      const horizontal = 2 * distance(points[0], points[3])
      return horizontal === 0 ? 1 : vertical / horizontal
    }
    const leftRatio = eyeRatio(leftEye)
    const rightRatio = eyeRatio(rightEye)
    const faceCenterX = (leftCheek.x + rightCheek.x) / 2
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 1
    const yaw = (nose.x - faceCenterX) / faceWidth

    const gesture = inferGesture({
      landmarks,
      config,
      lastTriggeredAt: lastTriggeredAtRef.current,
    })

    const line = gesture
      ? `gesture=${gesture.label} action=${gesture.action} conf=${gesture.confidence.toFixed(2)} leftEye=${leftRatio.toFixed(2)} rightEye=${rightRatio.toFixed(2)} yaw=${yaw.toFixed(2)} faces=${lastFaceCountRef.current} keypoints=${landmarks.length}`
      : `gesture=none leftEye=${leftRatio.toFixed(2)} rightEye=${rightRatio.toFixed(2)} yaw=${yaw.toFixed(2)} faces=${lastFaceCountRef.current} keypoints=${landmarks.length}`

    setDebugLines((prev) => [line, ...prev.slice(0, 7)])

    if (gesture && gesture.action !== 'none') {
      lastTriggeredAtRef.current = gesture.timestamp
      setLastGesture(gesture)
      onGesture(gesture)
    }
  }, [config, onGesture])

  const detectLoop = useCallback(() => {
    const video = videoRef.current
    const detector = detectorRef.current
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }

    const now = performance.now()
    if (detectEveryMsRef.current > 0 && now - lastDetectionAtRef.current < detectEveryMsRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }
    lastDetectionAtRef.current = now

    if ('detectForVideo' in detector) {
      const result = detector.detectForVideo(video, now)
      lastFaceCountRef.current = result.faceLandmarks?.length ?? 0
      lastKeypointCountRef.current = result.faceLandmarks?.[0]?.length ?? 0
      handleLandmarks(result.faceLandmarks?.[0])
      rafRef.current = requestAnimationFrame(detectLoop)
      return
    }

    detector.estimateFaces(video)
      .then((faces) => {
        lastFaceCountRef.current = faces.length
        lastKeypointCountRef.current = faces[0]?.keypoints?.length ?? 0
        const landmarks = faces[0]?.keypoints?.map((point) => ({
          x: point.x / Math.max(video.videoWidth || 1, 1),
          y: point.y / Math.max(video.videoHeight || 1, 1),
        }))
        handleLandmarks(landmarks)
        rafRef.current = requestAnimationFrame(detectLoop)
      })
      .catch(() => {
        rafRef.current = requestAnimationFrame(detectLoop)
      })
  }, [handleLandmarks])

  const start = useCallback(async () => {
    if (isRunning) return
    setError(null)
    setIsLoading(true)
    setInitStage('camera-starting')

    try {
      const stream = await requestCameraStream(cameraFacingMode)
      streamRef.current = stream

      if (!videoRef.current) throw new Error('Video element unavailable')
      videoRef.current.srcObject = stream
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      await videoRef.current.play()
      await new Promise((resolve) => window.setTimeout(resolve, isMobileDevice() ? 800 : 200))
      setIsRunning(true)
      setInitStage('camera-live')
      setDebugLines([
        `camera live video=${videoRef.current.videoWidth || 0}x${videoRef.current.videoHeight || 0} ready=${videoRef.current.readyState}`,
      ])

      try {
        const provider = selectGestureProvider()
        setInitStage('vision-loading')

        if (provider === 'mobile-tfjs') {
          detectorRef.current ??= await createMobileTfjsDetector()
        } else {
          detectorRef.current ??= await createDesktopMediaPipeDetector()
        }

        setInitStage('vision-live')
        rafRef.current = requestAnimationFrame(detectLoop)
      } catch (visionError) {
        setInitStage('vision-failed')
        detectEveryMsRef.current = 220
        setError(`Camera is live, but gesture model failed to load. ${normalizeVisionError(visionError)}`)
      }
    } catch (err) {
      setError(normalizeMediaError(err))
      setIsRunning(false)
      setInitStage('idle')
    } finally {
      setIsLoading(false)
    }
  }, [cameraFacingMode, detectLoop, isRunning])

  useEffect(() => stop, [stop])

  const switchCamera = useCallback(() => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user'
    setCameraFacingMode(nextMode)
    setDebugLines((prev) => [`camera facing mode switched to ${nextMode}`, ...prev.slice(0, 7)])
    if (isRunning) {
      stop()
      window.setTimeout(() => {
        void Promise.resolve().then(() => start())
      }, 150)
    }
  }, [cameraFacingMode, isRunning, start, stop])

  const controls = useMemo(
    () => ({ config, setConfig, isRunning, isLoading, error, lastGesture, debugLines, start, stop, initStage, cameraFacingMode, switchCamera }),
    [config, isRunning, isLoading, error, lastGesture, debugLines, start, stop, initStage, cameraFacingMode, switchCamera],
  )

  return { videoRef, ...controls }
}
