import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const [template, analysis] = await Promise.all([
  readFile(join(root, 'src/client.template.js'), 'utf8'),
  readFile(join(root, 'src/analysis.js'), 'utf8'),
])
const inlined = analysis.replace(/^export /gm, '').trim()
const placeholder = '    %%ANALYSIS%%'
if (!template.includes(placeholder)) throw new Error('client template is missing the analysis placeholder')
await writeFile(join(root, 'client.js'), template.replace(placeholder, inlined))
console.log('built client.js')
