import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useMicrophone } from '@/hooks/useMicrophone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Maximize2, Minimize2, Settings, Play, Pause, RotateCcw, Mic } from 'lucide-react'

export default function SoundCounter() {
  const [threshold, setThreshold] = useLocalStorage('soundCounter_threshold', 50)
  const [cooldownMs, setCooldownMs] = useLocalStorage('soundCounter_cooldownMs', 200)
  const [selectedDevice, setSelectedDevice] = useLocalStorage('soundCounter_selectedDevice', '')

  const [count, setCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfig, setShowConfig] = useState(true)
  const [triggersPerSec, setTriggersPerSec] = useState(0)
  const [pulse, setPulse] = useState(false)

  const lastTriggerRef = useRef(0)
  const triggerTimesRef = useRef<number[]>([])

  const { devices, level, error, isActive: micActive, initAudio, stopAudio } = useMicrophone({
    deviceId: selectedDevice,
    smoothingTimeConstant: 0.8,
  })

  // Check for threshold trigger
  useEffect(() => {
    if (!isActive || !micActive) return

    const now = Date.now()
    const normalized = level / 100

    if (normalized >= threshold / 100 && now - lastTriggerRef.current >= cooldownMs) {
      lastTriggerRef.current = now
      setCount(prev => prev + 1)
      setPulse(true)
      setTimeout(() => setPulse(false), 200)

      // Track trigger for rate calculation
      triggerTimesRef.current.push(now)
      // Keep only last 10 seconds
      triggerTimesRef.current = triggerTimesRef.current.filter(t => now - t < 10000)
    }
  }, [level, threshold, cooldownMs, isActive, micActive])

  // Calculate triggers per second
  useEffect(() => {
    if (!isActive) {
      setTriggersPerSec(0)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const recent = triggerTimesRef.current.filter(t => now - t < 1000)
      setTriggersPerSec(recent.length)
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  const toggleActive = async () => {
    if (!isActive) {
      try {
        await initAudio()
        setIsActive(true)
        setShowConfig(false)
      } catch (err) {
        console.error('Failed to initialize audio:', err)
      }
    } else {
      stopAudio()
      setIsActive(false)
      setShowConfig(true)
      triggerTimesRef.current = []
    }
  }

  const reset = () => {
    setCount(0)
    triggerTimesRef.current = []
    setTriggersPerSec(0)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const levelPercent = Math.round(level)

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className={`text-center transition-transform duration-200 ${pulse ? 'scale-110' : 'scale-100'}`}>
          <div className="text-9xl font-black text-text-primary mb-4">
            {count}
          </div>
          {isActive && (
            <div className="text-2xl text-text-secondary">
              {triggersPerSec.toFixed(1)} / sec
            </div>
          )}
        </div>

        {isActive && (
          <div className="absolute bottom-8 w-full max-w-md px-8">
            <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-75"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <div className="text-center text-sm text-text-muted mt-2">
              {levelPercent}%
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Sound-Zähler</h1>
          <p className="text-text-secondary mt-1">
            Zählt wie oft der Geräuschpegel einen Schwellwert überschreitet
          </p>
        </div>
        <div className="flex gap-2">
          {isActive && (
            <Button variant="outline" size="icon" onClick={() => setShowConfig(!showConfig)}>
              <Settings className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className={`transition-all ${pulse ? 'scale-[1.02]' : 'scale-100'}`}>
        <CardContent className="pt-8 pb-6">
          <div className="text-center">
            <div className="text-8xl font-black text-text-primary mb-2">
              {count}
            </div>
            {isActive && (
              <div className="text-xl text-text-secondary mb-4">
                {triggersPerSec.toFixed(1)} Trigger / Sekunde
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={toggleActive} className="px-8">
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mikrofonpegel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="h-8 bg-dark-900 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-75"
                  style={{ width: `${levelPercent}%` }}
                />
                {/* Threshold indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                  style={{ left: `${threshold}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>Pegel: {levelPercent}%</span>
                <span>Schwelle: {threshold}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Konfiguration
            </CardTitle>
            <CardDescription>
              Passe den Schwellwert und die Abklingzeit an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {devices.length > 0 && (
              <div>
                <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4" />
                  Mikrofon
                </label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  disabled={isActive}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-text-primary disabled:opacity-50"
                >
                  <option value="">Standard-Mikrofon</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Mikrofon ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Slider
              label="Schwellwert"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={1}
              max={100}
              disabled={isActive}
              showValue
            />

            <Slider
              label="Abklingzeit (ms)"
              value={cooldownMs}
              onChange={(e) => setCooldownMs(Number(e.target.value))}
              min={50}
              max={2000}
              step={50}
              disabled={isActive}
              showValue
            />

            <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-white/5">
              <p>• Schwellwert: Mindestlautstärke für Trigger</p>
              <p>• Abklingzeit: Minimale Zeit zwischen Triggern</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
