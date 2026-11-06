#!/usr/bin/env node
// Bundle src/client/ into the single client.js this package ships. DSH's client
// module system serves exactly one client.js per package, so the sources are
// bundled here instead of being imported at runtime.
//
//   node scripts/build-client.mjs           write client.js
//   node scripts/build-client.mjs --check   fail when client.js is stale
import { readFile, writeFile } from 'node:fs/promises'
import { build } from 'esbuild'

const OUT = 'client.js'
const BANNER =
  '/* Generated from src/client by scripts/build-client.mjs. Edit the sources, then run `npm run build`. */'
const check = process.argv.includes('--check')

const result = await build({
  entryPoints: ['src/client/index.js'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  write: false,
  logLevel: 'warning',
  legalComments: 'none',
  banner: { js: BANNER },
})

const output = result.outputFiles[0]?.text ?? ''

if (check) {
  const current = await readFile(OUT, 'utf8').catch(() => '')
  if (current !== output) {
    console.error(`${OUT} is stale: run \`npm run build\` and keep the result in the package.`)
    process.exit(1)
  }
  console.log(`${OUT} matches src/client`)
} else {
  await writeFile(OUT, output)
  console.log(`${OUT} built from src/client`)
}
