import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Project {
  title: string
  description: string
  'mp3-path': string
  'cover-jpg-path'?: string
  'cover-png-path'?: string
}

interface Config {
  'website-title': string
  'website-description': string
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch('/data/projects.json')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error('Error loading projects:', err))

    fetch('/data/config.json')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error('Error loading config:', err))
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
    if (projects.length === 0) return
    const shuffled = [...projects]
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setProjects(shuffled)
    // Always start playing the first song after shuffle
    setCurrentSongIndex(0)
    setIsPlaying(true)
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
        <h1>{config?.['website-title'] || 'Klangqualm'}</h1>
        <button onClick={shuffle} className="shuffle-button">Shuffle Songs</button>
      </header>

      {config?.['website-description'] && (
        <section className="website-description">
          <p>{config['website-description']}</p>
        </section>
      )}

      <main className="song-grid">
        {projects.map((project, index) => {
          const coverPath = project['cover-jpg-path'] || project['cover-png-path']
          const tileStyle = coverPath ? {
            '--cover-image': `url(/data/${coverPath.split('/').map(encodeURIComponent).join('/')})`,
            color: 'white'
          } as React.CSSProperties : {}

          return (
            <div
              key={project['mp3-path']}
              className={`song-tile ${currentSongIndex === index ? 'active' : ''} ${coverPath ? 'has-cover' : ''}`}
              style={tileStyle}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="controls">
              <button onClick={() => playSong(index)}>
                  {currentSongIndex === index && isPlaying ? 'Pause' : 'Play'}
                </button>
                <a
                  href={`/data/${project['mp3-path'].split('/').map(encodeURIComponent).join('/')}`}
                  download={project['mp3-path'].split('/').pop()}
                >
                  Download
                </a>
              </div>
            </div>
          )
        })}
      </main>

      {currentSongIndex !== null && projects[currentSongIndex] && (
        <div className="player-bar">
          <span>Now Playing: {projects[currentSongIndex].title}</span>
          <audio
            key={projects[currentSongIndex]['mp3-path']}
            ref={audioRef}
            src={`/data/${projects[currentSongIndex]['mp3-path'].split('/').map(encodeURIComponent).join('/')}`}
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
