import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Maximize2, Minimize2, Settings, Play, Trophy, Calculator, RotateCcw, Delete } from 'lucide-react'
import confetti from 'canvas-confetti'

type GameState = 'idle' | 'playing' | 'chainComplete'

interface Problem {
  a: number
  b: number
  answer: number
}

export default function Kettenrechner() {
  const audio = useAudio()

  const [maxNumber, setMaxNumber] = useLocalStorage('kettenrechner_maxNumber', 50)
  const [chainLength, setChainLength] = useLocalStorage('kettenrechner_chainLength', 10)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [userInput, setUserInput] = useState('')
  const [chainPosition, setChainPosition] = useState(0)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [showConfig, setShowConfig] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [completedChains, setCompletedChains] = useState(0)

  const chainStartRef = useRef(0)
  const chainTimeRef = useRef(0)

  const generateProblem = (): Problem => {
    const a = Math.floor(Math.random() * maxNumber) + 1
    const b = Math.floor(Math.random() * maxNumber) + 1
    return { a, b, answer: a + b }
  }

  const startGame = async () => {
    await audio.resumeContext()
    setGameState('playing')
    setCurrentProblem(generateProblem())
    setChainPosition(0)
    setScore(0)
    setErrors(0)
    setUserInput('')
    setShowConfig(false)
    chainStartRef.current = Date.now()
  }

  const stopGame = () => {
    setGameState('idle')
    setCurrentProblem(null)
    setShowConfig(true)
  }

  const handleNumberClick = (num: number) => {
    if (gameState !== 'playing') return
    setUserInput((prev) => prev + num.toString())
  }

  const handleBackspace = () => {
    if (gameState !== 'playing') return
    setUserInput((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (gameState !== 'playing') return
    setUserInput('')
  }

  const handleSubmit = () => {
    if (!currentProblem || userInput === '' || gameState !== 'playing') return

    const answer = parseInt(userInput, 10)
    const isCorrect = answer === currentProblem.answer

    if (isCorrect) {
      setScore((s) => s + 1)
      setFlash('correct')
      audio.playBeep(800, 0.1, 0.2)

      const newPosition = chainPosition + 1

      if (newPosition >= chainLength) {
        // Chain complete
        chainTimeRef.current = Date.now() - chainStartRef.current
        setGameState('chainComplete')
        setCompletedChains((c) => c + 1)
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        })
      } else {
        // Next problem
        setTimeout(() => {
          setCurrentProblem(generateProblem())
          setChainPosition(newPosition)
          setUserInput('')
          setFlash(null)
        }, 300)
      }
    } else {
      setErrors((e) => e + 1)
      setFlash('wrong')
      audio.playBeep(200, 0.2, 0.3)
      setTimeout(() => {
        setUserInput('')
        setFlash(null)
      }, 500)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return

    if (e.key >= '0' && e.key <= '9') {
      handleNumberClick(parseInt(e.key, 10))
    } else if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Backspace') {
      handleBackspace()
    } else if (e.key === 'Escape') {
      handleClear()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, userInput, currentProblem])

  const handlePlayAgain = () => {
    startGame()
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

  const accuracy = score + errors > 0 ? Math.round((score / (score + errors)) * 100) : 0
  const avgTimePerProblem = chainTimeRef.current > 0 ? (chainTimeRef.current / chainLength / 1000).toFixed(1) : '0'

  // Fullscreen view
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {gameState === 'playing' && currentProblem && (
          <>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl text-text-muted">
              {chainPosition + 1} / {chainLength}
            </div>

            <div className={`text-center transition-all duration-200 ${flash ? 'scale-110' : 'scale-100'}`}>
              <div className="text-8xl font-black text-text-primary mb-8">
                {currentProblem.a} + {currentProblem.b}
              </div>
              <div className="text-7xl font-black text-blue-500 mb-12 min-h-[100px]">
                {userInput || '_'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="p-6 text-3xl font-bold bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-text-primary"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="p-6 text-2xl font-bold bg-red-600/20 rounded-xl hover:bg-red-600/30 transition-colors text-red-500"
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick(0)}
                className="p-6 text-3xl font-bold bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-text-primary"
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                className="p-6 text-2xl font-bold bg-green-600/20 rounded-xl hover:bg-green-600/30 transition-colors text-green-500"
              >
                ✓
              </button>
            </div>
          </>
        )}

        {gameState === 'chainComplete' && (
          <div className="text-center space-y-6 animate-enter">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto animate-celebrate" />
            <div className="text-5xl font-bold text-text-primary">Kette abgeschlossen!</div>
            <div className="text-3xl text-green-500 font-bold">{score} / {chainLength}</div>
            <div className="text-xl text-text-secondary">{accuracy}% Genauigkeit</div>
            <div className="text-lg text-text-muted">{avgTimePerProblem}s pro Aufgabe</div>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={handlePlayAgain} size="lg" className="px-8">
                <RotateCcw className="w-5 h-5 mr-2" />
                Nächste Kette
              </Button>
              <Button variant="outline" size="lg" onClick={stopGame}>
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
          <h1 className="text-3xl font-bold text-text-primary">Kettenrechner</h1>
          <p className="text-text-secondary mt-1">Löse eine Kette von Rechenaufgaben</p>
        </div>
        <div className="flex gap-2">
          {gameState === 'playing' && (
            <Button variant="outline" size="icon" onClick={() => setShowConfig(!showConfig)}>
              <Settings className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {gameState === 'idle' && (
        <>
          <Card>
            <CardContent className="pt-8 pb-6 text-center">
              <Calculator className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Bereit?</h2>
              <p className="text-text-secondary mb-6">
                {chainLength} Aufgaben pro Kette. Zahlen von 1 bis {maxNumber}.
              </p>
              {completedChains > 0 && (
                <p className="text-yellow-500 mb-4">
                  Abgeschlossene Ketten: {completedChains}
                </p>
              )}
              <Button onClick={startGame} size="lg" className="px-8">
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
                <CardDescription>Passe Schwierigkeit und Kettenlänge an</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Slider
                  label="Maximale Zahl"
                  value={maxNumber}
                  onChange={(e) => setMaxNumber(Number(e.target.value))}
                  min={10}
                  max={100}
                  step={5}
                  showValue
                />

                <Slider
                  label="Kettenlänge"
                  value={chainLength}
                  onChange={(e) => setChainLength(Number(e.target.value))}
                  min={5}
                  max={20}
                  showValue
                />

                <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-white/5">
                  <p>• Maximale Zahl: Höchste Zahl in den Aufgaben</p>
                  <p>• Kettenlänge: Anzahl der Aufgaben pro Kette</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {gameState === 'playing' && currentProblem && (
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {chainPosition + 1} / {chainLength}
                  </div>
                  <div className="text-xs text-text-muted">Position</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{score}</div>
                  <div className="text-xs text-text-muted">Richtig</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{errors}</div>
                  <div className="text-xs text-text-muted">Falsch</div>
                </div>
              </div>
              <Button variant="outline" onClick={stopGame}>
                Stop
              </Button>
            </div>

            <div className={`text-center mb-8 transition-all duration-200 ${flash ? 'scale-105' : 'scale-100'}`}>
              <div className="text-6xl font-black text-text-primary mb-6">
                {currentProblem.a} + {currentProblem.b}
              </div>
              <div className="text-5xl font-black text-blue-500 mb-8 min-h-[80px] flex items-center justify-center">
                {userInput || <span className="text-text-muted">_</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="p-4 text-2xl font-bold bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-text-primary btn-press"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="p-4 text-xl font-bold bg-red-600/20 rounded-xl hover:bg-red-600/30 transition-colors text-red-500 btn-press"
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick(0)}
                className="p-4 text-2xl font-bold bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors text-text-primary btn-press"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="p-4 text-xl font-bold bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors text-text-primary btn-press"
              >
                <Delete className="w-5 h-5 mx-auto" />
              </button>
            </div>

            <Button onClick={handleSubmit} className="w-full py-6 text-xl" disabled={userInput === ''}>
              Prüfen
            </Button>

            <p className="text-center text-xs text-text-muted mt-4">
              Tastatur: 0-9 für Zahlen, Enter zum Prüfen, Backspace zum Löschen
            </p>
          </CardContent>
        </Card>
      )}

      {gameState === 'chainComplete' && (
        <Card className="animate-enter">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Kette abgeschlossen!
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
              <div className="text-2xl font-bold text-text-primary">{avgTimePerProblem}s</div>
              <div className="text-sm text-text-muted">Durchschnittliche Zeit pro Aufgabe</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-xl font-bold text-yellow-500">
                {completedChains} Kette{completedChains !== 1 ? 'n' : ''} abgeschlossen
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePlayAgain} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Nächste Kette
              </Button>
              <Button variant="outline" onClick={stopGame} className="flex-1">
                Beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
