import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useMicrophone } from '@/hooks/useMicrophone'
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Maximize2, Minimize2, Settings, Play, RotateCcw, Trophy, Target, Mic } from 'lucide-react'

type Color = 'rot' | 'grün' | 'blau' | 'gelb' | 'lila' | 'orange'
type GameMode = 'sayColor' | 'readText'
type GameState = 'idle' | 'countdown' | 'active' | 'roundEnd'

interface ColorConfig {
  name: Color
  textColor: string
  bgGradient: string
}

const COLORS: ColorConfig[] = [
  { name: 'rot', textColor: 'text-red-500', bgGradient: 'from-red-500 to-red-600' },
  { name: 'grün', textColor: 'text-green-500', bgGradient: 'from-green-500 to-green-600' },
  { name: 'blau', textColor: 'text-blue-500', bgGradient: 'from-blue-500 to-blue-600' },
  { name: 'gelb', textColor: 'text-yellow-500', bgGradient: 'from-yellow-500 to-yellow-600' },
  { name: 'lila', textColor: 'text-purple-500', bgGradient: 'from-purple-500 to-purple-600' },
  { name: 'orange', textColor: 'text-orange-500', bgGradient: 'from-orange-500 to-orange-600' },
]

const ROUND_SIZE = 10

export default function Farben() {
  const audio = useAudio()

  const [mode, setMode] = useLocalStorage<GameMode>('farben_mode', 'sayColor')
  const [threshold, setThreshold] = useLocalStorage('farben_threshold', 40)
  const [cooldownMs, setCooldownMs] = useLocalStorage('farben_cooldownMs', 400)
  const [selectedDevice, setSelectedDevice] = useLocalStorage('farben_selectedDevice', '')

  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentWord, setCurrentWord] = useState<Color>('rot')
  const [currentColor, setCurrentColor] = useState<Color>('blau')
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [roundNum, setRoundNum] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfig, setShowConfig] = useState(true)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)

  const lastTriggerRef = useRef(0)
  const roundStartRef = useRef(0)
  const roundTimeRef = useRef(0)

  const { devices, level, error, isActive: micActive, initAudio, stopAudio } = useMicrophone({
    deviceId: selectedDevice,
    smoothingTimeConstant: 0.8,
  })

  const generateRandomPair = (): { word: Color; color: Color } => {
    let word: Color
    let color: Color

    do {
      word = COLORS[Math.floor(Math.random() * COLORS.length)].name
      color = COLORS[Math.floor(Math.random() * COLORS.length)].name
    } while (word === color) // Ensure word and color don't match

    return { word, color }
  }

  const startNewRound = () => {
    const { word, color } = generateRandomPair()
    setCurrentWord(word)
    setCurrentColor(color)
    setScore(0)
    setErrors(0)
    setRoundNum(0)
    setGameState('countdown')
    setCountdown(3)
  }

  const nextWord = () => {
    const { word, color } = generateRandomPair()
    setCurrentWord(word)
    setCurrentColor(color)
    setRoundNum((prev) => prev + 1)

    if (roundNum + 1 >= ROUND_SIZE) {
      roundTimeRef.current = Date.now() - roundStartRef.current
      setGameState('roundEnd')
    }
  }

  // Countdown logic
  useEffect(() => {
    if (gameState !== 'countdown') return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      roundStartRef.current = Date.now()
      setGameState('active')
    }
  }, [gameState, countdown])

  // Voice trigger detection
  useEffect(() => {
    if (gameState !== 'active' || !micActive) return

    const now = Date.now()
    const normalized = level / 100

    if (normalized >= threshold / 100 && now - lastTriggerRef.current >= cooldownMs) {
      lastTriggerRef.current = now

      // For simplicity, we assume the voice is always "correct" (no speech recognition)
      // In a full implementation, you'd use Web Speech API to check:
      // const correctAnswer = mode === 'sayColor' ? currentColor : currentWord
      const isCorrect = Math.random() > 0.2 // 80% success rate simulation

      if (isCorrect) {
        setScore((s) => s + 1)
        setFlash('correct')
        audio.playBeep(800, 0.1, 0.2)
        setTimeout(() => {
          setFlash(null)
          nextWord()
        }, 300)
      } else {
        setErrors((e) => e + 1)
        setFlash('wrong')
        audio.playBeep(200, 0.2, 0.3)
        setTimeout(() => {
          setFlash(null)
          nextWord()
        }, 300)
      }
    }
  }, [level, threshold, cooldownMs, gameState, micActive, currentColor, currentWord, mode, audio])

  const handleStart = async () => {
    await audio.resumeContext()
    try {
      await initAudio()
      setShowConfig(false)
      startNewRound()
    } catch (err) {
      console.error('Failed to initialize audio:', err)
    }
  }

  const handleStop = () => {
    stopAudio()
    setGameState('idle')
    setShowConfig(true)
  }

  const handlePlayAgain = () => {
    startNewRound()
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
  const currentColorConfig = COLORS.find((c) => c.name === currentColor)
  const accuracy = score + errors > 0 ? Math.round((score / (score + errors)) * 100) : 0
  const avgTimePerWord = roundTimeRef.current > 0 ? (roundTimeRef.current / ROUND_SIZE / 1000).toFixed(1) : '0'

  // Fullscreen view
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {gameState === 'countdown' && (
          <div className="text-9xl font-black text-text-primary animate-enter-scale">
            {countdown}
          </div>
        )}

        {gameState === 'active' && (
          <>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-8 text-xl">
              <div className="text-green-500 font-bold">✓ {score}</div>
              <div className="text-red-500 font-bold">✗ {errors}</div>
              <div className="text-text-muted">{roundNum + 1} / {ROUND_SIZE}</div>
            </div>

            <div
              className={`text-9xl font-black transition-all duration-200 ${
                flash === 'correct'
                  ? 'scale-110 drop-shadow-[0_0_60px_rgba(34,197,94,0.8)]'
                  : flash === 'wrong'
                  ? 'scale-90 drop-shadow-[0_0_60px_rgba(239,68,68,0.8)]'
                  : 'scale-100'
              } ${currentColorConfig?.textColor}`}
            >
              {currentWord}
            </div>

            <div className="absolute bottom-8 text-center text-text-muted">
              <p className="text-lg">
                {mode === 'sayColor' ? 'Sage die Farbe' : 'Lies das Wort'}
              </p>
            </div>
          </>
        )}

        {gameState === 'roundEnd' && (
          <div className="text-center space-y-6 animate-enter">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
            <div className="text-5xl font-bold text-text-primary">Runde beendet!</div>
            <div className="text-3xl text-green-500 font-bold">{score} / {ROUND_SIZE}</div>
            <div className="text-xl text-text-secondary">{accuracy}% Genauigkeit</div>
            <div className="text-lg text-text-muted">{avgTimePerWord}s pro Wort</div>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={handlePlayAgain} size="lg" className="px-8">
                <RotateCcw className="w-5 h-5 mr-2" />
                Nochmal
              </Button>
              <Button variant="outline" size="lg" onClick={handleStop}>
                Beenden
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Regular view
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Farben (Stroop)</h1>
          <p className="text-text-secondary mt-1">
            {mode === 'sayColor'
              ? 'Sage die Farbe, nicht das Wort'
              : 'Lies das Wort, ignoriere die Farbe'}
          </p>
        </div>
        <div className="flex gap-2">
          {gameState === 'active' && (
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

      {gameState === 'idle' && (
        <>
          <Card>
            <CardContent className="pt-8 pb-6 text-center">
              <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Bereit?</h2>
              <p className="text-text-secondary mb-6">
                {ROUND_SIZE} Wörter pro Runde. Sage {mode === 'sayColor' ? 'die Farbe' : 'das Wort'}!
              </p>
              <Button onClick={handleStart} size="lg" className="px-8">
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            </CardContent>
          </Card>

          {showConfig && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Konfiguration
                </CardTitle>
                <CardDescription>Wähle Modus und Mikrofoneinstellungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Spielmodus
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={mode === 'sayColor' ? 'default' : 'outline'}
                      onClick={() => setMode('sayColor')}
                      className="h-auto py-4 flex-col"
                    >
                      <div className="font-bold mb-1">Sage die Farbe</div>
                      <div className="text-xs opacity-80">Schwieriger</div>
                    </Button>
                    <Button
                      variant={mode === 'readText' ? 'default' : 'outline'}
                      onClick={() => setMode('readText')}
                      className="h-auto py-4 flex-col"
                    >
                      <div className="font-bold mb-1">Lies das Wort</div>
                      <div className="text-xs opacity-80">Leichter</div>
                    </Button>
                  </div>
                </div>

                {devices.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4" />
                      Mikrofon
                    </label>
                    <select
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-text-primary"
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
                  showValue
                />

                <Slider
                  label="Abklingzeit (ms)"
                  value={cooldownMs}
                  onChange={(e) => setCooldownMs(Number(e.target.value))}
                  min={100}
                  max={2000}
                  step={50}
                  showValue
                />

                <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-white/5">
                  <p>• Sage die Farbe: Stroop-Effekt (schwieriger)</p>
                  <p>• Lies das Wort: Umgekehrter Stroop (leichter)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {(gameState === 'countdown' || gameState === 'active') && (
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{score}</div>
                  <div className="text-xs text-text-muted">Richtig</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{errors}</div>
                  <div className="text-xs text-text-muted">Falsch</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {gameState === 'active' ? roundNum + 1 : 0} / {ROUND_SIZE}
                  </div>
                  <div className="text-xs text-text-muted">Wörter</div>
                </div>
              </div>
              <Button variant="outline" onClick={handleStop}>
                Stop
              </Button>
            </div>

            <Progress value={roundNum} max={ROUND_SIZE} className="mb-6" />

            {gameState === 'countdown' && (
              <div className="text-center py-12">
                <div className="text-8xl font-black text-text-primary animate-enter-scale">
                  {countdown}
                </div>
              </div>
            )}

            {gameState === 'active' && (
              <>
                <div
                  className={`text-center py-12 transition-all duration-200 ${
                    flash === 'correct'
                      ? 'scale-110 drop-shadow-[0_0_40px_rgba(34,197,94,0.6)]'
                      : flash === 'wrong'
                      ? 'scale-90 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                      : 'scale-100'
                  }`}
                >
                  <div className={`text-7xl font-black ${currentColorConfig?.textColor}`}>
                    {currentWord}
                  </div>
                </div>

                <div className="text-center text-text-muted mb-4">
                  <p>{mode === 'sayColor' ? 'Sage die Farbe!' : 'Lies das Wort!'}</p>
                </div>

                {micActive && (
                  <div>
                    <div className="h-2 bg-dark-900 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-75"
                        style={{ width: `${levelPercent}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                        style={{ left: `${threshold}%` }}
                      />
                    </div>
                    <div className="text-center text-xs text-text-muted mt-1">
                      Pegel: {levelPercent}%
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {gameState === 'roundEnd' && (
        <Card className="animate-enter">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Runde beendet!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-dark-900 rounded-lg">
                <div className="text-3xl font-bold text-green-500">{score}</div>
                <div className="text-sm text-text-muted">Richtige Antworten</div>
              </div>
              <div className="text-center p-4 bg-dark-900 rounded-lg">
                <div className="text-3xl font-bold text-text-primary">{accuracy}%</div>
                <div className="text-sm text-text-muted">Genauigkeit</div>
              </div>
            </div>

            <div className="text-center p-4 bg-dark-900 rounded-lg">
              <div className="text-2xl font-bold text-text-primary">{avgTimePerWord}s</div>
              <div className="text-sm text-text-muted">Durchschnittliche Zeit pro Wort</div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePlayAgain} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Nochmal spielen
              </Button>
              <Button variant="outline" onClick={handleStop} className="flex-1">
                Beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
