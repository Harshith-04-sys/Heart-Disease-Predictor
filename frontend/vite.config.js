import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  cacheDir: path.join(
    process.env.LOCALAPPDATA ?? os.tmpdir(),
    'Heart-DiseasePredictor-vite-cache'
  ),
  build: {
    outDir: 'dist'
  }
})
