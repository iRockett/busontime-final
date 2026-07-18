import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEncodeJobs } from '../encode.mjs'

test('desktop H.264 encode is silent, compatible, and fast-start optimized', () => {
  const job = buildEncodeJobs().find(({ name }) => name === 'hero-v3.mp4')
  assert.ok(job.args.includes('libx264'))
  assert.ok(job.args.includes('yuv420p'))
  assert.ok(job.args.includes('+faststart'))
  assert.ok(job.args.includes('-an'))
  assert.ok(job.args.includes('30'))
})

test('desktop WebM encode uses VP9', () => {
  const job = buildEncodeJobs().find(({ name }) => name === 'hero-v3.webm')
  assert.ok(job.args.includes('libvpx-vp9'))
  assert.ok(job.args.includes('-an'))
})
