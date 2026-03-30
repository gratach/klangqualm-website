import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Project {
  title: string
  description: string
  'mp3-path': string
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch('/data/projects.json')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error('Error loading projects:', err))
  }, [])

  const playSong = (index: number) => {
    if (currentSongIndex === index) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentSongIndex(index)
      setIsPlaying(true)
      // Audio element will load and play via useEffect or autoPlay
    }
  }

  const shuffle = () => {
    const shuffled = [...projects].sort(() => Math.random() - 0.5)
    setProjects(shuffled)
    setCurrentSongIndex(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }

  const handleEnded = () => {
    if (currentSongIndex !== null && currentSongIndex < projects.length - 1) {
      playSong(currentSongIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Klangqualm</h1>
        <button onClick={shuffle} className="shuffle-button">Shuffle Songs</button>
      </header>

      <main className="song-grid">
        {projects.map((project, index) => (
          <div key={index} className={`song-tile ${currentSongIndex === index ? 'active' : ''}`}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="controls">
              <button onClick={() => playSong(index)}>
                {currentSongIndex === index && isPlaying ? 'Pause' : 'Play'}
              </button>
              <a href={`/data/${project['mp3-path']}`} download={project['mp3-path'].split('/').pop()}>
                Download
              </a>
            </div>
          </div>
        ))}
      </main>

      {currentSongIndex !== null && (
        <div className="player-bar">
          <span>Now Playing: {projects[currentSongIndex].title}</span>
          <audio
            ref={audioRef}
            src={`/data/${projects[currentSongIndex]['mp3-path']}`}
            autoPlay
            controls
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  )
}

export default App
