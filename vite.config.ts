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
          const url = new URL(req.url, 'http://localhost')
          const decodedPath = decodeURIComponent(url.pathname.slice(1))
          const fullPath = path.resolve(process.cwd(), decodedPath)

          // Security: check if path is still within project root/data
          const dataRoot = path.resolve(process.cwd(), 'data')
          if (!fullPath.startsWith(dataRoot)) {
            res.statusCode = 403
            res.end('Forbidden')
            return
          }

          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const stats = fs.statSync(fullPath)
            const range = req.headers.range

            if (req.url.endsWith('.json')) res.setHeader('Content-Type', 'application/json')
            if (req.url.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg')
            if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) res.setHeader('Content-Type', 'image/jpeg')
            if (req.url.endsWith('.png')) res.setHeader('Content-Type', 'image/png')

            if (range) {
              const parts = range.replace(/bytes=/, "").split("-")
              const start = parseInt(parts[0], 10)
              const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
              const chunksize = (end - start) + 1
              const file = fs.createReadStream(fullPath, { start, end })
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
              })
              file.pipe(res)
            } else {
              res.writeHead(200, {
                'Content-Length': stats.size,
              })
              fs.createReadStream(fullPath).pipe(res)
            }
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
