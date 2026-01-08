import { useState, useEffect, useRef, useCallback } from 'react'

export interface MicrophoneOptions {
  onLevelChange?: (level: number) => void
  selectedDeviceId?: string
  deviceId?: string
  smoothingTimeConstant?: number
}

export function useMicrophone(options: MicrophoneOptions = {}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [_stream, setStream] = useState<MediaStream | null>(null)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState('')
  const [isActive, setIsActive] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const frameIdRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  // Load available devices
  const loadDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const microphones = allDevices.filter((d) => d.kind === 'audioinput')
      setDevices(microphones)
    } catch (e) {
      console.error('Error loading devices:', e)
    }
  }, [])

  // Initialize audio
  const initAudio = useCallback(async () => {
    try {
      setError('')

      const deviceIdToUse = options.deviceId || options.selectedDeviceId
      const constraints: MediaStreamConstraints = {
        audio: deviceIdToUse
          ? { deviceId: { exact: deviceIdToUse } }
          : true,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      streamRef.current = mediaStream

      // Reload devices after permission granted
      await loadDevices()

      // Set up audio analysis
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(mediaStream)
      analyserRef.current = audioContextRef.current.createAnalyser()

      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = options.smoothingTimeConstant ?? 0.5

      source.connect(analyserRef.current)

      setIsActive(true)

      // Start analysis loop
      const loop = () => {
        if (!analyserRef.current) return

        const data = new Uint8Array(analyserRef.current.fftSize)
        analyserRef.current.getByteTimeDomainData(data)

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)

        // Scale to 0-100
        const newLevel = Math.min(100, rms * 400)
        setLevel(newLevel)
        options.onLevelChange?.(newLevel)

        frameIdRef.current = requestAnimationFrame(loop)
      }

      frameIdRef.current = requestAnimationFrame(loop)
    } catch (e) {
      console.error('Microphone access error:', e)
      setError('Could not access microphone. Please check permissions.')
      setIsActive(false)
    }
  }, [options, loadDevices])

  // Stop audio
  const stopAudio = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setStream(null)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setLevel(0)
    setIsActive(false)
  }, [])

  // Load devices on mount
  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  return {
    devices,
    level,
    error,
    isActive,
    initAudio,
    stopAudio,
  }
}
