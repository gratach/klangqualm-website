import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function dataPlugin(): Plugin {
  return {
    name: 'data-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/data/')) {
          const relativePath = req.url.slice(1)
          const fullPath = path.resolve(process.cwd(), relativePath)
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            if (req.url.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
            if (req.url.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg')
            res.end(fs.readFileSync(fullPath))
            return
          }
        }
        next()
      })
    },
    closeBundle() {
      const src = path.resolve(process.cwd(), 'data')
      const dest = path.resolve(process.cwd(), 'dist/data')
      if (fs.existsSync(src)) {
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
          fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
        }
        copyRecursiveSync(src, dest)
      }
    }
  }
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats && stats.isDirectory()
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest)
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dataPlugin()],
})
