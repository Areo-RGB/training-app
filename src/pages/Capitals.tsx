import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Maximize2, Minimize2, Play, Trophy, Globe, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

type Region = 'europe' | 'north-america' | 'south-america' | 'asia' | 'africa' | 'oceania' | 'world'

interface CountryCapital {
  country: string
  capital: string
}

const REGION_DATA: Record<Region, CountryCapital[]> = {
  europe: [
    { country: 'Deutschland', capital: 'Berlin' },
    { country: 'Frankreich', capital: 'Paris' },
    { country: 'Spanien', capital: 'Madrid' },
    { country: 'Italien', capital: 'Rom' },
    { country: 'Polen', capital: 'Warschau' },
    { country: 'Niederlande', capital: 'Amsterdam' },
    { country: 'Belgien', capital: 'Brüssel' },
    { country: 'Österreich', capital: 'Wien' },
    { country: 'Schweiz', capital: 'Bern' },
    { country: 'Schweden', capital: 'Stockholm' },
    { country: 'Norwegen', capital: 'Oslo' },
    { country: 'Dänemark', capital: 'Kopenhagen' },
    { country: 'Finnland', capital: 'Helsinki' },
    { country: 'Portugal', capital: 'Lissabon' },
    { country: 'Griechenland', capital: 'Athen' },
    { country: 'Ungarn', capital: 'Budapest' },
    { country: 'Tschechien', capital: 'Prag' },
    { country: 'Rumänien', capital: 'Bukarest' },
    { country: 'Irland', capital: 'Dublin' },
    { country: 'Kroatien', capital: 'Zagreb' },
  ],
  'north-america': [
    { country: 'USA', capital: 'Washington D.C.' },
    { country: 'Kanada', capital: 'Ottawa' },
    { country: 'Mexiko', capital: 'Mexiko-Stadt' },
    { country: 'Kuba', capital: 'Havanna' },
    { country: 'Guatemala', capital: 'Guatemala-Stadt' },
    { country: 'Honduras', capital: 'Tegucigalpa' },
    { country: 'Nicaragua', capital: 'Managua' },
    { country: 'Costa Rica', capital: 'San José' },
    { country: 'Panama', capital: 'Panama-Stadt' },
    { country: 'Jamaika', capital: 'Kingston' },
  ],
  'south-america': [
    { country: 'Brasilien', capital: 'Brasília' },
    { country: 'Argentinien', capital: 'Buenos Aires' },
    { country: 'Chile', capital: 'Santiago de Chile' },
    { country: 'Kolumbien', capital: 'Bogotá' },
    { country: 'Peru', capital: 'Lima' },
    { country: 'Venezuela', capital: 'Caracas' },
    { country: 'Ecuador', capital: 'Quito' },
    { country: 'Bolivien', capital: 'Sucre' },
    { country: 'Paraguay', capital: 'Asunción' },
    { country: 'Uruguay', capital: 'Montevideo' },
  ],
  asia: [
    { country: 'China', capital: 'Peking' },
    { country: 'Japan', capital: 'Tokio' },
    { country: 'Indien', capital: 'Neu-Delhi' },
    { country: 'Südkorea', capital: 'Seoul' },
    { country: 'Thailand', capital: 'Bangkok' },
    { country: 'Vietnam', capital: 'Hanoi' },
    { country: 'Indonesien', capital: 'Jakarta' },
    { country: 'Philippinen', capital: 'Manila' },
    { country: 'Malaysia', capital: 'Kuala Lumpur' },
    { country: 'Singapur', capital: 'Singapur' },
    { country: 'Pakistan', capital: 'Islamabad' },
    { country: 'Bangladesch', capital: 'Dhaka' },
    { country: 'Iran', capital: 'Teheran' },
    { country: 'Irak', capital: 'Bagdad' },
    { country: 'Saudi-Arabien', capital: 'Riad' },
  ],
  africa: [
    { country: 'Ägypten', capital: 'Kairo' },
    { country: 'Südafrika', capital: 'Pretoria' },
    { country: 'Nigeria', capital: 'Abuja' },
    { country: 'Kenia', capital: 'Nairobi' },
    { country: 'Äthiopien', capital: 'Addis Abeba' },
    { country: 'Ghana', capital: 'Accra' },
    { country: 'Marokko', capital: 'Rabat' },
    { country: 'Algerien', capital: 'Algier' },
    { country: 'Tunesien', capital: 'Tunis' },
    { country: 'Tansania', capital: 'Dodoma' },
  ],
  oceania: [
    { country: 'Australien', capital: 'Canberra' },
    { country: 'Neuseeland', capital: 'Wellington' },
    { country: 'Fidschi', capital: 'Suva' },
    { country: 'Papua-Neuguinea', capital: 'Port Moresby' },
    { country: 'Samoa', capital: 'Apia' },
    { country: 'Tonga', capital: "Nuku'alofa" },
    { country: 'Vanuatu', capital: 'Port Vila' },
    { country: 'Salomonen', capital: 'Honiara' },
  ],
  world: [], // Will be filled dynamically
}

// Combine all regions for 'world'
REGION_DATA.world = [
  ...REGION_DATA.europe,
  ...REGION_DATA['north-america'],
  ...REGION_DATA['south-america'],
  ...REGION_DATA.asia,
  ...REGION_DATA.africa,
  ...REGION_DATA.oceania,
]

const REGION_LABELS: Record<Region, string> = {
  europe: 'Europa',
  'north-america': 'Nordamerika',
  'south-america': 'Südamerika',
  asia: 'Asien',
  africa: 'Afrika',
  oceania: 'Ozeanien',
  world: 'Welt',
}

export default function Capitals() {
  const audio = useAudio()

  const [selectedRegion, setSelectedRegion] = useLocalStorage<Region>('capitals_region', 'europe')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<CountryCapital | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())

  const generateQuestion = () => {
    const data = REGION_DATA[selectedRegion]
    if (data.length === 0) return

    // Filter out used questions
    const available = data.filter((q) => !usedQuestions.has(q.country))

    // If all questions used, reset
    if (available.length === 0) {
      setUsedQuestions(new Set())
      return generateQuestion()
    }

    const question = available[Math.floor(Math.random() * available.length)]
    const wrongAnswers = data
      .filter((q) => q.capital !== question.capital)
      .map((q) => q.capital)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [question.capital, ...wrongAnswers].sort(() => Math.random() - 0.5)

    setCurrentQuestion(question)
    setOptions(allOptions)
    setFeedback(null)
    setSelectedAnswer(null)
    setUsedQuestions((prev) => new Set([...prev, question.country]))
  }

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || feedback) return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.capital

    if (isCorrect) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setFeedback('correct')
      audio.playBeep(800, 0.15, 0.2)

      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1)
      }

      if ((streak + 1) % 10 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    } else {
      setStreak(0)
      setFeedback('wrong')
      audio.playBeep(200, 0.2, 0.3)
    }

    setTotal((t) => t + 1)

    setTimeout(() => {
      generateQuestion()
    }, 1500)
  }

  const startQuiz = async () => {
    await audio.resumeContext()
    setIsPlaying(true)
    setScore(0)
    setTotal(0)
    setStreak(0)
    setUsedQuestions(new Set())
    generateQuestion()
  }

  const stopQuiz = () => {
    setIsPlaying(false)
    setCurrentQuestion(null)
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

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  // Fullscreen view
  if (isFullscreen && isPlaying && currentQuestion) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-8 text-xl">
          <div className="text-text-primary font-bold">
            {score} / {total}
          </div>
          <div className="text-yellow-500 font-bold">🔥 {streak}</div>
        </div>

        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <div className="text-2xl text-text-secondary mb-4">Was ist die Hauptstadt von</div>
            <div className="text-6xl font-black text-text-primary mb-12">
              {currentQuestion.country}?
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === option
              const isCorrectAnswer = option === currentQuestion.capital
              const showResult = feedback !== null

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`p-8 rounded-xl text-2xl font-bold transition-all ${
                    showResult && isCorrectAnswer
                      ? 'bg-green-500 text-white scale-105'
                      : showResult && isSelected
                      ? 'bg-red-500 text-white scale-95'
                      : 'bg-dark-800 text-text-primary hover:bg-dark-700 hover:scale-105'
                  } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Regular view
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Hauptstädte</h1>
          <p className="text-text-secondary mt-1">Teste dein Wissen über Hauptstädte</p>
        </div>
        {isPlaying && (
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!isPlaying && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Region wählen
              </CardTitle>
              <CardDescription>Wähle eine Region für das Quiz</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(REGION_LABELS) as Region[]).map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion(region)}
                  className="h-auto py-4"
                >
                  <div>
                    <div className="font-bold">{REGION_LABELS[region]}</div>
                    <div className="text-xs opacity-80">{REGION_DATA[region].length} Länder</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-6 text-center">
              <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">Bereit?</h2>
              <p className="text-text-secondary mb-6">
                Region: {REGION_LABELS[selectedRegion]} ({REGION_DATA[selectedRegion].length}{' '}
                Länder)
              </p>
              {bestStreak > 0 && (
                <p className="text-yellow-500 mb-4">
                  Beste Serie: 🔥 {bestStreak}
                </p>
              )}
              <Button onClick={startQuiz} size="lg" className="px-8">
                <Play className="w-5 h-5 mr-2" />
                Quiz starten
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {isPlaying && currentQuestion && (
        <>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">
                      {score} / {total}
                    </div>
                    <div className="text-xs text-text-muted">Punkte</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{accuracy}%</div>
                    <div className="text-xs text-text-muted">Genauigkeit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">🔥 {streak}</div>
                    <div className="text-xs text-text-muted">Serie</div>
                  </div>
                </div>
                <Button variant="outline" onClick={stopQuiz}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Neu starten
                </Button>
              </div>

              <div className="text-center mb-8">
                <div className="text-lg text-text-secondary mb-2">Was ist die Hauptstadt von</div>
                <div className="text-5xl font-black text-text-primary mb-8">
                  {currentQuestion.country}?
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((option, idx) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectAnswer = option === currentQuestion.capital
                  const showResult = feedback !== null

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={`p-6 rounded-xl text-xl font-bold transition-all ${
                        showResult && isCorrectAnswer
                          ? 'bg-green-500 text-white scale-105'
                          : showResult && isSelected
                          ? 'bg-red-500 text-white scale-95'
                          : 'bg-dark-800 text-text-primary hover:bg-dark-700 hover:scale-[1.02]'
                      } disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {bestStreak > 0 && (
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-center gap-2 text-yellow-500">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">Beste Serie: 🔥 {bestStreak}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
