import { describe, expect, it } from 'vitest'
import ein, {
  exportedBindings,
  hmrSnippet,
  shouldTransform,
  transformModule,
} from '@ludic/ein/vite'

const sample = `
import { System } from '@ludic/ein'
export class Movement extends System {}
export default class Render extends System {}
export const speed = 2
export function helper() {}
const Local = 1, Other = 2
export { Local, Other as Renamed }
export { Reexported } from './elsewhere'
export * from './all'
`

describe('vite plugin', () => {
  it('finds exported bindings', () => {
    expect(exportedBindings(sample)).toEqual([
      ['Movement', 'Movement'],
      ['default', 'Render'],
      ['speed', 'speed'],
      ['helper', 'helper'],
      ['Local', 'Local'],
      ['Renamed', 'Other'],
    ])
  })

  it('appends a self-accepting snippet', () => {
    const snippet = hmrSnippet([
      ['default', 'Render'],
      ['Movement', 'Movement'],
    ])
    expect(snippet).toContain('const __ein_prev = { "default": Render, "Movement": Movement };')
    expect(snippet).toContain('import.meta.hot.accept(')
    expect(snippet).toContain('globalThis.__EIN_HMR__')
    const out = transformModule('/app/src/systems.ts', sample)
    expect(out?.startsWith(sample)).toBe(true)
    expect(out).toContain('runtime.reload(__ein_prev, mod)')
  })

  it('only transforms script modules that use ein or opt in', () => {
    expect(shouldTransform('/app/src/a.ts', sample)).toBe(true)
    expect(shouldTransform('/app/src/a.ts?v=1', sample)).toBe(true)
    expect(shouldTransform('/app/node_modules/x/a.ts', sample)).toBe(false)
    expect(shouldTransform('/app/src/a.css', sample)).toBe(false)
    expect(shouldTransform('/app/src/plain.ts', 'export class P { x = 0 }')).toBe(false)
    expect(shouldTransform('/app/src/plain.ts', '// @ein-hmr\nexport class P { x = 0 }')).toBe(true)
    expect(
      shouldTransform('/app/src/plain.ts', 'export class P {}', {
        include: (id) => id.endsWith('plain.ts'),
      }),
    ).toBe(true)
    expect(transformModule('/app/src/empty.ts', "import '@ludic/ein'\nconsole.log(1)")).toBeNull()
  })

  it('exposes a serve-only post plugin', () => {
    const plugin = ein()
    expect(plugin.name).toBe('ein:hmr')
    expect(plugin.apply).toBe('serve')
    expect(plugin.enforce).toBe('post')
    const transform = plugin.transform as (
      this: void,
      code: string,
      id: string,
    ) => { code: string } | null
    expect(transform.call(undefined, 'export const a = 1', '/app/a.ts')).toBeNull()
    expect(transform.call(undefined, sample, '/app/a.ts')?.code).toContain('__ein_prev')
  })
})
