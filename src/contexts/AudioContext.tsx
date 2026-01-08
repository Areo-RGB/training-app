import { createContext, useContext, useRef, ReactNode } from 'react'

interface AudioContextValue {
  playBeep: (freq?: number, duration?: number, volume?: number) => void
  resumeContext: () => Promise<void>
}

const AudioReactContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getContext = (): AudioContext | null => {
    if (!audioContextRef.current) {
      try {
        // Support both standard and webkit-prefixed AudioContext
        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioCtx()
      } catch (e) {
        console.error('AudioContext not supported', e)
      }
    }
    return audioContextRef.current
  }

  const resumeContext = async (): Promise<void> => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  const playBeep = (freq = 600, duration = 0.15, vol = 0.1): void => {
    const ctx = getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = freq

    const now = ctx.currentTime

    // Envelope Configuration
    const attack = 0.01
    const decay = 0.02

    // Adjust envelope for very short sounds
    let safeAttack = attack
    let safeDecay = decay

    if (duration < attack + decay) {
      safeAttack = duration * 0.3
      safeDecay = duration * 0.6
    }

    // Schedule Ramps
    // 1. Attack
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(vol, now + safeAttack)

    // 2. Decay
    const decayStart = Math.max(now + safeAttack, now + duration - safeDecay)

    gain.gain.setValueAtTime(vol, decayStart)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.start(now)
    osc.stop(now + duration + 0.1)
  }

  return (
    <AudioReactContext.Provider value={{ playBeep, resumeContext }}>
      {children}
    </AudioReactContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioReactContext)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context
}
