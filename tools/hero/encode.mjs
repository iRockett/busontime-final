import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'

const desktopFrames = path.join(HERO_CONFIG.workDir, 'frames', 'desktop', 'frame-%04d.png')
const mobileFrames = path.join(HERO_CONFIG.workDir, 'frames', 'mobile', 'frame-%04d.png')

function videoArgs(input, output, codecArgs) {
  return ['-hide_banner', '-y', '-framerate', String(HERO_CONFIG.fps), '-i', input,
    '-frames:v', String(HERO_CONFIG.encodedFrames), ...codecArgs, '-pix_fmt', 'yuv420p', '-an', output]
}

export function buildEncodeJobs() {
  return [
    {
      name: 'hero-v3.mp4',
      args: videoArgs(desktopFrames, path.join(HERO_CONFIG.publicDir, 'hero-v3.mp4'),
        ['-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart']),
    },
    {
      name: 'hero-v3.webm',
      args: videoArgs(desktopFrames, path.join(HERO_CONFIG.publicDir, 'hero-v3.webm'),
        ['-c:v', 'libvpx-vp9', '-crf', '28', '-b:v', '0', '-deadline', 'good', '-cpu-used', '1']),
    },
    {
      name: 'mobile-v3.mp4',
      args: videoArgs(mobileFrames, path.join(HERO_CONFIG.publicDir, 'mobile-v3.mp4'),
        ['-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart']),
    },
  ]
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve(output) : reject(new Error(`${path.basename(command)} failed (${code})\n${output}`)))
  })
}

const commandLine = (args) => [ffmpegPath, ...args].map((value) => /\s/.test(value) ? `"${value}"` : value).join(' ')

async function assertFramesExist(format) {
  const directory = path.join(HERO_CONFIG.workDir, 'frames', format)
  const missing = []
  for (let frame = 0; frame < HERO_CONFIG.encodedFrames; frame += 1) {
    const filename = path.join(directory, `frame-${String(frame).padStart(4, '0')}.png`)
    try { await fs.access(filename) } catch { missing.push(filename) }
  }
  if (missing.length) throw new Error(`Missing ${missing.length} ${format} render frames; run hero:render first`)
}

async function createPosters() {
  const desktop = path.join(HERO_CONFIG.workDir, 'frames', 'desktop', 'frame-0000.png')
  const mobile = path.join(HERO_CONFIG.workDir, 'frames', 'mobile', 'frame-0000.png')
  await sharp(desktop).webp({ quality: 90 }).toFile(path.join(HERO_CONFIG.publicDir, 'poster-v3.webp'))
  await sharp(desktop).jpeg({ quality: 92, progressive: true, mozjpeg: true }).toFile(path.join(HERO_CONFIG.publicDir, 'poster-v3.jpg'))
  await sharp(mobile).webp({ quality: 88 }).toFile(path.join(HERO_CONFIG.publicDir, 'mobile-v3.webp'))
}

async function main() {
  await Promise.all(['desktop', 'mobile'].map(assertFramesExist))
  await fs.mkdir(HERO_CONFIG.publicDir, { recursive: true })
  await fs.mkdir(HERO_CONFIG.outputDir, { recursive: true })
  const jobs = buildEncodeJobs()
  await fs.writeFile(path.join(HERO_CONFIG.outputDir, 'ffmpeg-commands.txt'), `${jobs.map((job) => commandLine(job.args)).join('\n')}\n`)
  for (const job of jobs) await run(ffmpegPath, job.args)
  await createPosters()
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) await main()
