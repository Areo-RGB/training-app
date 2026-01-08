import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Maximize2, Minimize2, Play, Pause, RotateCcw, Plus, Trash2, Copy, Timer as TimerIcon, Edit2, Check, X } from 'lucide-react'

interface TimerInstance {
  id: string
  name: string
  durationSec: number
  intervalSec: number
  volumeBoost: boolean
}

type RunState = 'idle' | 'running' | 'paused' | 'complete'

const DEFAULT_TIMER: Omit<TimerInstance, 'id'> = {
  name: 'Neuer Timer',
  durationSec: 60,
  intervalSec: 5,
  volumeBoost: false,
}

export default function Timers() {
  const audio = useAudio()

  const [timers, setTimers] = useLocalStorage<TimerInstance[]>('timers_sequence', [
    { id: '1', name: 'Aufwärmphase', durationSec: 30, intervalSec: 5, volumeBoost: false },
    { id: '2', name: 'Trainingsphase', durationSec: 60, intervalSec: 10, volumeBoost: false },
    { id: '3', name: 'Abkühlphase', durationSec: 30, intervalSec: 5, volumeBoost: false },
  ])

  const [runState, setRunState] = useState<RunState>('idle')
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<TimerInstance, 'id'> | null>(null)

  const intervalRef = useRef<number | null>(null)
  const lastBeepRef = useRef(0)

  const currentTimer = runState !== 'idle' && currentTimerIndex < timers.length ? timers[currentTimerIndex] : null
  const totalDuration = timers.reduce((sum, t) => sum + t.durationSec, 0)
  const remainingSec = currentTimer ? currentTimer.durationSec - elapsedSec : 0

  // Run timer logic
  useEffect(() => {
    if (runState !== 'running') return

    intervalRef.current = window.setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1

        // Check if current timer is done
        if (currentTimer && next >= currentTimer.durationSec) {
          // Move to next timer
          if (currentTimerIndex + 1 < timers.length) {
            setCurrentTimerIndex((i) => i + 1)
            return 0
          } else {
            // All timers complete
            setRunState('complete')
            if (intervalRef.current) clearInterval(intervalRef.current)
            return prev
          }
        }

        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [runState, currentTimer, currentTimerIndex, timers])

  // Beep logic
  useEffect(() => {
    if (runState !== 'running' || !currentTimer) return

    const now = Date.now()
    const shouldBeep = elapsedSec > 0 && elapsedSec % currentTimer.intervalSec === 0

    if (shouldBeep && now - lastBeepRef.current >= 900) {
      lastBeepRef.current = now
      const vol = currentTimer.volumeBoost ? 0.8 : 0.15
      audio.playBeep(600, 0.15, vol)
    }
  }, [runState, elapsedSec, currentTimer, audio])

  const handleStart = async () => {
    if (timers.length === 0) return
    await audio.resumeContext()
    setRunState('running')
    setCurrentTimerIndex(0)
    setElapsedSec(0)
    lastBeepRef.current = 0
  }

  const handlePause = () => {
    setRunState('paused')
  }

  const handleResume = () => {
    setRunState('running')
  }

  const handleStop = () => {
    setRunState('idle')
    setCurrentTimerIndex(0)
    setElapsedSec(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const handleRestart = () => {
    handleStop()
    setTimeout(() => handleStart(), 100)
  }

  const handleAddTimer = () => {
    const newTimer: TimerInstance = {
      ...DEFAULT_TIMER,
      id: Date.now().toString(),
    }
    setTimers([...timers, newTimer])
  }

  const handleDeleteTimer = (id: string) => {
    setTimers(timers.filter((t) => t.id !== id))
  }

  const handleDuplicateTimer = (timer: TimerInstance) => {
    const newTimer: TimerInstance = {
      ...timer,
      id: Date.now().toString(),
      name: `${timer.name} (Kopie)`,
    }
    setTimers([...timers, newTimer])
  }

  const startEditing = (timer: TimerInstance) => {
    setEditingId(timer.id)
    setEditForm({ name: timer.name, durationSec: timer.durationSec, intervalSec: timer.intervalSec, volumeBoost: timer.volumeBoost })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEditing = () => {
    if (!editingId || !editForm) return
    setTimers(timers.map((t) => (t.id === editingId ? { ...t, ...editForm } : t)))
    cancelEditing()
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

  // Fullscreen view
  if (isFullscreen && runState !== 'idle') {
    return (
      <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {runState === 'complete' ? (
          <div className="text-center space-y-6 animate-enter">
            <TimerIcon className="w-20 h-20 text-green-500 mx-auto" />
            <div className="text-5xl font-bold text-text-primary">Sequenz abgeschlossen!</div>
            <div className="text-2xl text-text-secondary">{timers.length} Timer abgeschlossen</div>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={handleRestart} size="lg" className="px-8">
                <RotateCcw className="w-5 h-5 mr-2" />
                Neu starten
              </Button>
              <Button variant="outline" size="lg" onClick={handleStop}>
                Beenden
              </Button>
            </div>
          </div>
        ) : (
          currentTimer && (
            <>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xl text-text-muted">
                {currentTimerIndex + 1} / {timers.length}
              </div>

              <div className="text-center mb-8">
                <div className="text-3xl text-text-secondary mb-4">{currentTimer.name}</div>
                <div className="text-9xl font-black text-text-primary">
                  {Math.floor(remainingSec / 60)}:{(remainingSec % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="w-full max-w-2xl space-y-4">
                <Progress value={elapsedSec} max={currentTimer.durationSec} className="h-3" />

                <div className="flex gap-4 justify-center">
                  {runState === 'running' ? (
                    <Button onClick={handlePause} size="lg" variant="outline">
                      <Pause className="w-6 h-6 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={handleResume} size="lg">
                      <Play className="w-6 h-6 mr-2" />
                      Fortsetzen
                    </Button>
                  )}
                  <Button onClick={handleStop} size="lg" variant="outline">
                    Stop
                  </Button>
                </div>
              </div>
            </>
          )
        )}
      </div>
    )
  }

  // Regular view
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Timer-Sequenzen</h1>
          <p className="text-text-secondary mt-1">Erstelle und spiele Timer-Sequenzen ab</p>
        </div>
        <div className="flex gap-2">
          {runState !== 'idle' && (
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {runState === 'idle' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Timer-Sequenz</CardTitle>
                  <CardDescription>
                    {timers.length} Timer · {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} min gesamt
                  </CardDescription>
                </div>
                <Button onClick={handleAddTimer} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Timer hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {timers.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <TimerIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Keine Timer in der Sequenz.</p>
                  <p className="text-sm">Füge Timer hinzu, um zu beginnen.</p>
                </div>
              ) : (
                timers.map((timer, idx) => (
                  <Card key={timer.id} className="bg-dark-900">
                    <CardContent className="pt-4 pb-4">
                      {editingId === timer.id && editForm ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-text-primary"
                            placeholder="Timer-Name"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Slider
                              label="Dauer (Sekunden)"
                              value={editForm.durationSec}
                              onChange={(e) => setEditForm({ ...editForm, durationSec: Number(e.target.value) })}
                              min={5}
                              max={600}
                              step={5}
                              showValue
                            />
                            <Slider
                              label="Intervall (Sekunden)"
                              value={editForm.intervalSec}
                              onChange={(e) => setEditForm({ ...editForm, intervalSec: Number(e.target.value) })}
                              min={1}
                              max={60}
                              showValue
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`boost-${timer.id}`}
                              checked={editForm.volumeBoost}
                              onChange={(e) => setEditForm({ ...editForm, volumeBoost: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <label htmlFor={`boost-${timer.id}`} className="text-sm text-text-primary">
                              Lautstärke verstärken
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={saveEditing} size="sm" className="flex-1">
                              <Check className="w-4 h-4 mr-2" />
                              Speichern
                            </Button>
                            <Button onClick={cancelEditing} size="sm" variant="outline" className="flex-1">
                              <X className="w-4 h-4 mr-2" />
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-text-muted w-8">{idx + 1}</div>
                            <div>
                              <div className="font-bold text-text-primary">{timer.name}</div>
                              <div className="text-sm text-text-secondary">
                                {Math.floor(timer.durationSec / 60)}:{(timer.durationSec % 60).toString().padStart(2, '0')} ·
                                Intervall: {timer.intervalSec}s
                                {timer.volumeBoost && ' · 🔊'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => startEditing(timer)} size="sm" variant="outline">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDuplicateTimer(timer)} size="sm" variant="outline">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteTimer(timer.id)} size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {timers.length > 0 && (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Button onClick={handleStart} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Sequenz starten
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {runState !== 'idle' && (
        <>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-text-muted">
                  Timer {currentTimerIndex + 1} / {timers.length}
                </div>
                <div className="flex gap-2">
                  {runState === 'running' ? (
                    <Button onClick={handlePause} size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : runState === 'paused' ? (
                    <Button onClick={handleResume} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Fortsetzen
                    </Button>
                  ) : null}
                  <Button onClick={handleStop} size="sm" variant="outline">
                    Stop
                  </Button>
                </div>
              </div>

              {runState === 'complete' ? (
                <div className="text-center py-12 space-y-4">
                  <TimerIcon className="w-16 h-16 text-green-500 mx-auto" />
                  <div className="text-3xl font-bold text-text-primary">Sequenz abgeschlossen!</div>
                  <div className="text-text-secondary">{timers.length} Timer abgeschlossen</div>
                  <Button onClick={handleRestart} className="px-6">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Neu starten
                  </Button>
                </div>
              ) : (
                currentTimer && (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-xl text-text-secondary mb-2">{currentTimer.name}</div>
                      <div className="text-7xl font-black text-text-primary">
                        {Math.floor(remainingSec / 60)}:{(remainingSec % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <Progress value={elapsedSec} max={currentTimer.durationSec} className="mb-4" />

                    <div className="text-center text-sm text-text-muted">
                      {elapsedSec}s / {currentTimer.durationSec}s
                    </div>
                  </>
                )
              )}
            </CardContent>
          </Card>

          {runState !== 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verbleibende Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {timers.map((timer, idx) => (
                  <div
                    key={timer.id}
                    className={`p-3 rounded-lg ${
                      idx === currentTimerIndex
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : idx < currentTimerIndex
                        ? 'bg-green-500/10 border border-green-500/30 opacity-50'
                        : 'bg-dark-900 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-text-muted">{idx + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{timer.name}</div>
                          <div className="text-xs text-text-secondary">
                            {Math.floor(timer.durationSec / 60)}:{(timer.durationSec % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                      {idx < currentTimerIndex && (
                        <div className="text-green-500 text-sm font-bold">✓</div>
                      )}
                      {idx === currentTimerIndex && (
                        <div className="text-blue-500 text-sm font-bold">→</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
